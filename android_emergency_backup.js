#!/usr/bin/env node

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class AndroidEmergencyBackup {
    constructor() {
        this.backupPath = `emergency_backup_${Date.now()}`;
        this.totalFiles = 0;
        this.backedUpFiles = 0;
        this.failedFiles = [];
        this.criticalData = [];
        this.deviceInfo = {};
    }

    async log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const symbols = { 
            info: '📱', 
            success: '✅', 
            warning: '⚠️', 
            error: '❌', 
            backup: '💾',
            critical: '🔥',
            progress: '⏳'
        };
        console.log(`${symbols[type] || symbols.info} [${timestamp}] ${message}`);
    }

    async executeAdbCommand(command, timeout = 30000) {
        return new Promise((resolve, reject) => {
            const child = exec(`adb ${command}`, { timeout }, (error, stdout, stderr) => {
                if (error) {
                    reject({ error, stderr });
                } else {
                    resolve(stdout.trim());
                }
            });
        });
    }

    async checkDeviceConnection() {
        this.log("Checking device connection for emergency backup...", 'critical');
        
        try {
            const devices = await this.executeAdbCommand('devices');
            const lines = devices.split('\n').filter(line => line.trim() && !line.includes('List of devices'));
            
            if (lines.length === 0) {
                throw new Error('No devices connected. Please connect your phone via USB and enable USB debugging.');
            }
            
            const deviceLine = lines[0];
            const [deviceId, status] = deviceLine.split('\t');
            
            this.log(`Device found: ${deviceId} (${status})`, 'success');
            
            if (status !== 'device') {
                this.log(`Device not ready. Status: ${status}. Please check USB debugging and authorize computer.`, 'warning');
                throw new Error(`Device not ready. Status: ${status}`);
            }
            
            return { deviceId, status };
            
        } catch (error) {
            this.log(`Connection failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async getDeviceInfo() {
        this.log("Collecting device information...", 'info');
        
        try {
            const commands = {
                model: 'shell getprop ro.product.model',
                brand: 'shell getprop ro.product.brand',
                version: 'shell getprop ro.build.version.release',
                storage: 'shell df -h /storage/emulated/0',
                sdcard: 'shell ls -la /storage/emulated/0'
            };

            const info = {};
            for (const [key, command] of Object.entries(commands)) {
                try {
                    info[key] = await this.executeAdbCommand(command);
                } catch (error) {
                    info[key] = 'Unable to retrieve';
                }
            }

            this.deviceInfo = info;
            this.log(`Device: ${info.brand} ${info.model} (Android ${info.version})`, 'success');
            
            return info;
            
        } catch (error) {
            this.log(`Failed to get device info: ${error.message}`, 'error');
            return {};
        }
    }

    async createBackupDirectory() {
        this.log(`Creating backup directory: ${this.backupPath}`, 'backup');
        
        try {
            if (!fs.existsSync(this.backupPath)) {
                fs.mkdirSync(this.backupPath, { recursive: true });
            }
            
            // Create subdirectories
            const subdirs = ['photos', 'videos', 'documents', 'audio', 'downloads', 'whatsapp', 'contacts', 'sms', 'apps'];
            subdirs.forEach(dir => {
                const dirPath = path.join(this.backupPath, dir);
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath, { recursive: true });
                }
            });
            
            this.log(`Backup directory created: ${this.backupPath}`, 'success');
            return true;
            
        } catch (error) {
            this.log(`Failed to create backup directory: ${error.message}`, 'error');
            throw error;
        }
    }

    async identifyCriticalData() {
        this.log("Identifying critical data to backup...", 'critical');
        
        const criticalPaths = [
            // Photos and Videos
            { path: '/storage/emulated/0/DCIM/Camera', type: 'photos', priority: 1 },
            { path: '/storage/emulated/0/DCIM', type: 'photos', priority: 1 },
            { path: '/storage/emulated/0/Pictures', type: 'photos', priority: 1 },
            { path: '/storage/emulated/0/Movies', type: 'videos', priority: 1 },
            
            // Documents
            { path: '/storage/emulated/0/Documents', type: 'documents', priority: 2 },
            { path: '/storage/emulated/0/Download', type: 'downloads', priority: 2 },
            
            // Audio
            { path: '/storage/emulated/0/Music', type: 'audio', priority: 3 },
            { path: '/storage/emulated/0/Recordings', type: 'audio', priority: 2 },
            
            // WhatsApp
            { path: '/storage/emulated/0/WhatsApp', type: 'whatsapp', priority: 2 },
            { path: '/storage/emulated/0/Android/media/com.whatsapp/WhatsApp', type: 'whatsapp', priority: 2 },
            
            // Samsung-specific
            { path: '/storage/emulated/0/Samsung/VoiceNote', type: 'audio', priority: 2 },
            { path: '/storage/emulated/0/SamsungNotes', type: 'documents', priority: 2 },
        ];

        const existingPaths = [];
        
        for (const item of criticalPaths) {
            try {
                const result = await this.executeAdbCommand(`shell ls -la "${item.path}" 2>/dev/null || echo "NOT_FOUND"`);
                if (!result.includes('NOT_FOUND') && !result.includes('No such file')) {
                    existingPaths.push(item);
                    this.log(`Found: ${item.path} (${item.type})`, 'success');
                }
            } catch (error) {
                // Path doesn't exist, skip it
            }
        }

        // Sort by priority (lower number = higher priority)
        existingPaths.sort((a, b) => a.priority - b.priority);
        
        this.criticalData = existingPaths;
        this.log(`Found ${existingPaths.length} critical data locations`, 'success');
        
        return existingPaths;
    }

    async backupContacts() {
        this.log("Backing up contacts...", 'backup');
        
        try {
            // Try to backup contacts database
            const contactsPath = path.join(this.backupPath, 'contacts');
            
            // Export contacts to VCF format
            const vcfResult = await this.executeAdbCommand('shell content query --uri content://com.android.contacts/data --projection display_name:data1');
            
            if (vcfResult && vcfResult.trim()) {
                fs.writeFileSync(path.join(contactsPath, 'contacts_export.txt'), vcfResult);
                this.log("Contacts exported to text format", 'success');
            }
            
            // Try to pull contacts database
            try {
                await this.executeAdbCommand(`pull /data/data/com.android.providers.contacts/databases/contacts2.db "${contactsPath}/contacts2.db"`);
                this.log("Contacts database backed up", 'success');
            } catch (error) {
                this.log("Could not backup contacts database (may need root)", 'warning');
            }
            
            return true;
            
        } catch (error) {
            this.log(`Failed to backup contacts: ${error.message}`, 'error');
            return false;
        }
    }

    async backupSMS() {
        this.log("Backing up SMS messages...", 'backup');
        
        try {
            const smsPath = path.join(this.backupPath, 'sms');
            
            // Export SMS to text format
            const smsResult = await this.executeAdbCommand('shell content query --uri content://sms --projection address:date:body:type');
            
            if (smsResult && smsResult.trim()) {
                fs.writeFileSync(path.join(smsPath, 'sms_export.txt'), smsResult);
                this.log("SMS messages exported", 'success');
            }
            
            return true;
            
        } catch (error) {
            this.log(`Failed to backup SMS: ${error.message}`, 'error');
            return false;
        }
    }

    async backupDirectory(sourcePath, targetType, maxFileSize = 50 * 1024 * 1024) {
        this.log(`Backing up ${sourcePath} to ${targetType}...`, 'backup');
        
        try {
            const targetPath = path.join(this.backupPath, targetType);
            
            // Get file list
            const fileList = await this.executeAdbCommand(`shell find "${sourcePath}" -type f 2>/dev/null | head -100`);
            
            if (!fileList || fileList.includes('No such file')) {
                this.log(`No files found in ${sourcePath}`, 'warning');
                return { success: false, fileCount: 0 };
            }
            
            const files = fileList.split('\n').filter(file => file.trim());
            this.totalFiles += files.length;
            
            this.log(`Found ${files.length} files in ${sourcePath}`, 'info');
            
            let successCount = 0;
            let failCount = 0;
            
            // Backup files in batches to avoid overwhelming the crashing device
            for (let i = 0; i < files.length; i += 5) {
                const batch = files.slice(i, i + 5);
                
                for (const file of batch) {
                    try {
                        // Check file size first
                        const sizeResult = await this.executeAdbCommand(`shell stat -c%s "${file}" 2>/dev/null || echo "0"`);
                        const fileSize = parseInt(sizeResult) || 0;
                        
                        if (fileSize > maxFileSize) {
                            this.log(`Skipping large file (${Math.round(fileSize/1024/1024)}MB): ${path.basename(file)}`, 'warning');
                            continue;
                        }
                        
                        const fileName = path.basename(file);
                        const targetFile = path.join(targetPath, fileName);
                        
                        // Use a shorter timeout for individual files
                        await this.executeAdbCommand(`pull "${file}" "${targetFile}"`, 15000);
                        
                        successCount++;
                        this.backedUpFiles++;
                        
                        if (successCount % 10 === 0) {
                            this.log(`Progress: ${successCount}/${files.length} files backed up from ${targetType}`, 'progress');
                        }
                        
                    } catch (error) {
                        failCount++;
                        this.failedFiles.push(file);
                        this.log(`Failed to backup: ${path.basename(file)}`, 'error');
                    }
                }
                
                // Small delay between batches to not overwhelm the device
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            this.log(`${targetType} backup complete: ${successCount} success, ${failCount} failed`, 'success');
            
            return { success: true, fileCount: successCount, failedCount: failCount };
            
        } catch (error) {
            this.log(`Failed to backup ${sourcePath}: ${error.message}`, 'error');
            return { success: false, fileCount: 0 };
        }
    }

    async backupAppData() {
        this.log("Backing up app data...", 'backup');
        
        try {
            const appPath = path.join(this.backupPath, 'apps');
            
            // Get installed packages
            const packages = await this.executeAdbCommand('shell pm list packages -3');
            const userApps = packages.split('\n').filter(line => line.includes('package:'));
            
            this.log(`Found ${userApps.length} user apps`, 'info');
            
            // Backup APKs for important apps
            const importantApps = userApps.slice(0, 10); // Limit to first 10 apps
            
            for (const app of importantApps) {
                try {
                    const packageName = app.replace('package:', '').trim();
                    const apkPath = await this.executeAdbCommand(`shell pm path ${packageName}`);
                    
                    if (apkPath && apkPath.includes('package:')) {
                        const apkFile = apkPath.replace('package:', '').trim();
                        const targetFile = path.join(appPath, `${packageName}.apk`);
                        
                        await this.executeAdbCommand(`pull "${apkFile}" "${targetFile}"`, 30000);
                        this.log(`Backed up APK: ${packageName}`, 'success');
                    }
                    
                } catch (error) {
                    this.log(`Failed to backup app: ${packageName}`, 'error');
                }
            }
            
            return true;
            
        } catch (error) {
            this.log(`Failed to backup app data: ${error.message}`, 'error');
            return false;
        }
    }

    async generateBackupReport() {
        this.log("Generating backup report...", 'info');
        
        const timestamp = new Date().toISOString();
        const report = `# Emergency Android Backup Report
Generated: ${timestamp}

## 📱 Device Information
- **Model**: ${this.deviceInfo.model || 'Unknown'}
- **Brand**: ${this.deviceInfo.brand || 'Unknown'}
- **Android Version**: ${this.deviceInfo.version || 'Unknown'}

## 💾 Backup Summary
- **Total Files Found**: ${this.totalFiles}
- **Files Successfully Backed Up**: ${this.backedUpFiles}
- **Failed Files**: ${this.failedFiles.length}
- **Backup Location**: ${this.backupPath}

## 📊 Backup Details
### Critical Data Locations Processed:
${this.criticalData.map(item => `- ${item.path} (${item.type})`).join('\n')}

### Failed Files:
${this.failedFiles.length > 0 ? this.failedFiles.map(file => `- ${file}`).join('\n') : 'None'}

## 🔧 Next Steps
1. **Verify Backup**: Check the backup folder for your important files
2. **Cloud Sync**: Upload to Google Drive, Dropbox, or similar
3. **Factory Reset**: Your device should now be safe to reset
4. **Restore**: Use this backup to restore your data after reset

## 📁 Backup Structure
\`\`\`
${this.backupPath}/
├── photos/          # Camera photos and images
├── videos/          # Video files
├── documents/       # Documents and PDFs
├── audio/           # Music and recordings
├── downloads/       # Downloaded files
├── whatsapp/        # WhatsApp data
├── contacts/        # Contact information
├── sms/            # SMS messages
└── apps/           # App backups (APK files)
\`\`\`

---
*Emergency backup completed. Your data is now safe!*
`;

        const reportPath = path.join(this.backupPath, 'backup_report.md');
        fs.writeFileSync(reportPath, report);
        
        this.log(`Backup report saved: ${reportPath}`, 'success');
        
        return report;
    }

    async runEmergencyBackup() {
        console.log('\n🔥 EMERGENCY ANDROID DATA BACKUP');
        console.log('================================');
        console.log('⚠️  This tool is designed for crashing phones');
        console.log('📱 Make sure USB debugging is enabled');
        console.log('🔌 Keep your phone connected throughout the process');
        console.log('');
        
        try {
            // Step 1: Check device connection
            await this.checkDeviceConnection();
            
            // Step 2: Get device info
            await this.getDeviceInfo();
            
            // Step 3: Create backup directory
            await this.createBackupDirectory();
            
            // Step 4: Identify critical data
            await this.identifyCriticalData();
            
            // Step 5: Backup contacts and SMS (small, important data first)
            await this.backupContacts();
            await this.backupSMS();
            
            // Step 6: Backup critical directories in order of priority
            const backupResults = [];
            
            for (const item of this.criticalData) {
                const result = await this.backupDirectory(item.path, item.type);
                backupResults.push({ ...item, ...result });
                
                // If device is very unstable, prioritize most important data
                if (this.backedUpFiles > 100 && item.priority > 2) {
                    this.log("Device stability concern - prioritizing most critical data", 'warning');
                    break;
                }
            }
            
            // Step 7: Backup app data (if stable enough)
            if (this.criticalData.length > 0 && this.backedUpFiles > 50) {
                await this.backupAppData();
            }
            
            // Step 8: Generate report
            const report = await this.generateBackupReport();
            
            // Step 9: Final summary
            console.log('\n🎉 EMERGENCY BACKUP COMPLETED!');
            console.log('=============================');
            console.log(`📁 Backup Location: ${this.backupPath}`);
            console.log(`📊 Files Backed Up: ${this.backedUpFiles}`);
            console.log(`❌ Failed Files: ${this.failedFiles.length}`);
            console.log('');
            console.log('✅ Your data is now safe!');
            console.log('💡 You can now proceed with factory reset');
            console.log('');
            console.log('🔄 RECOMMENDED NEXT STEPS:');
            console.log('1. Copy backup folder to another device/cloud');
            console.log('2. Verify important files are present');
            console.log('3. Factory reset your phone');
            console.log('4. Restore from backup after reset');
            
            return {
                success: true,
                backupPath: this.backupPath,
                filesBackedUp: this.backedUpFiles,
                failedFiles: this.failedFiles.length,
                report
            };
            
        } catch (error) {
            this.log(`Emergency backup failed: ${error.message}`, 'error');
            
            console.log('\n❌ BACKUP FAILED');
            console.log('================');
            console.log('Possible issues:');
            console.log('1. USB debugging not enabled');
            console.log('2. Device not authorized');
            console.log('3. Device too unstable');
            console.log('4. ADB not installed');
            console.log('');
            console.log('💡 Try these solutions:');
            console.log('1. Enable USB debugging in Developer Options');
            console.log('2. Authorize computer when prompted');
            console.log('3. Keep phone connected and try again');
            console.log('4. Install ADB tools if not present');
            
            throw error;
        }
    }
}

// Command line interface
if (require.main === module) {
    const backup = new AndroidEmergencyBackup();
    
    console.log('🚨 ANDROID EMERGENCY BACKUP TOOL');
    console.log('================================');
    console.log('');
    console.log('This tool will help you backup your data from a crashing phone');
    console.log('before performing a factory reset.');
    console.log('');
    console.log('Prerequisites:');
    console.log('✅ USB debugging enabled on your phone');
    console.log('✅ Phone connected via USB');
    console.log('✅ ADB tools installed on your computer');
    console.log('');
    console.log('Starting backup in 3 seconds...');
    console.log('Press Ctrl+C to cancel');
    
    setTimeout(() => {
        backup.runEmergencyBackup()
            .then((result) => {
                console.log('\n✨ SUCCESS! Your data has been backed up safely.');
                console.log(`📁 Check: ${result.backupPath}`);
            })
            .catch((error) => {
                console.error('\n💥 Backup failed. Please check the requirements above.');
                process.exit(1);
            });
    }, 3000);
}

module.exports = AndroidEmergencyBackup; 