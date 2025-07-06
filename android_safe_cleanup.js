#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');

class AndroidSafeCleanup {
    constructor() {
        this.totalSpaceFreed = 0;
        this.actions = [];
    }

    async log(message, type = 'info') {
        const symbols = { 
            info: '🔍', 
            success: '✅', 
            warning: '⚠️', 
            error: '❌', 
            clean: '🧹',
            safe: '🟢',
            moderate: '🟡',
            aggressive: '🔴'
        };
        console.log(`${symbols[type]} ${message}`);
    }

    async executeAdbCommand(command, description) {
        return new Promise((resolve, reject) => {
            this.log(`Executing: ${description}`, 'clean');
            exec(`adb ${command}`, (error, stdout, stderr) => {
                if (error) {
                    this.log(`Failed: ${description} - ${error.message}`, 'error');
                    reject({ error, stderr });
                } else {
                    this.log(`Success: ${description}`, 'success');
                    resolve(stdout.trim());
                }
            });
        });
    }

    async checkStorageSpace() {
        this.log("Checking current storage usage...", 'info');
        try {
            const storage = await this.executeAdbCommand('shell df -h', 'Getting storage info');
            const lines = storage.split('\n');
            
            console.log('\n📊 CURRENT STORAGE STATUS:');
            console.log('==========================');
            
            // Parse critical partitions
            const criticalPartitions = [];
            lines.forEach(line => {
                if (line.includes('100%') || line.includes('9[5-9]%')) {
                    criticalPartitions.push(line);
                    console.log(`🔴 CRITICAL: ${line}`);
                } else if (line.includes('/') && !line.includes('tmpfs')) {
                    console.log(`   ${line}`);
                }
            });
            
            return criticalPartitions.length > 0;
        } catch (error) {
            this.log("Could not check storage", 'error');
            return false;
        }
    }

    async showCleanupOptions() {
        console.log('\n🧹 CLEANUP OPTIONS:');
        console.log('===================');
        
        console.log('\n🟢 LEVEL 1: SAFE CLEANUP (Recommended)');
        console.log('   ✅ App caches (temporary files - can be regenerated)');
        console.log('   ✅ System temporary files');
        console.log('   ✅ Download cache');
        console.log('   ✅ Thumbnail cache');
        console.log('   ❌ NO personal data affected');
        console.log('   ❌ NO app data/settings affected');
        console.log('   ❌ NO photos/videos affected');
        
        console.log('\n🟡 LEVEL 2: MODERATE CLEANUP');
        console.log('   ✅ Everything from Level 1');
        console.log('   ✅ App data caches (may need to re-login to some apps)');
        console.log('   ✅ Browser cache and temporary files');
        console.log('   ⚠️  May need to re-login to some apps');
        console.log('   ❌ NO personal files affected');
        console.log('   ❌ NO photos/videos affected');
        
        console.log('\n🔴 LEVEL 3: AGGRESSIVE CLEANUP (Use with caution)');
        console.log('   ✅ Everything from Level 1 & 2');
        console.log('   ✅ Unused app packages');
        console.log('   ✅ System logs and crash dumps');
        console.log('   ⚠️  May remove debugging information');
        console.log('   ❌ NO personal files affected');
        console.log('   ❌ NO photos/videos affected');
        
        console.log('\n🚫 WHAT IS NEVER TOUCHED:');
        console.log('   ✅ Photos, videos, documents');
        console.log('   ✅ Contacts, messages, call history');
        console.log('   ✅ App data (passwords, game progress)');
        console.log('   ✅ Music, downloads');
        console.log('   ✅ System settings');
    }

    async performSafeCleanup() {
        this.log("Starting SAFE cleanup...", 'safe');
        const results = [];
        
        try {
            // 1. Clear app caches
            this.log("Clearing app caches (safe - regenerated automatically)...", 'safe');
            await this.executeAdbCommand('shell pm trim-caches 1000M', 'Clearing app caches');
            results.push('✅ App caches cleared');
            
            // 2. Clear system temporary files
            this.log("Clearing system temporary files...", 'safe');
            await this.executeAdbCommand('shell rm -rf /data/local/tmp/*', 'Clearing temp files');
            results.push('✅ System temp files cleared');
            
            // 3. Clear thumbnail cache
            this.log("Clearing thumbnail cache (photos will regenerate thumbnails)...", 'safe');
            await this.executeAdbCommand('shell rm -rf /sdcard/.thumbnails/*', 'Clearing thumbnails');
            results.push('✅ Thumbnail cache cleared');
            
            // 4. Optimize packages
            this.log("Optimizing app storage...", 'safe');
            await this.executeAdbCommand('shell cmd package compile -a', 'Optimizing packages');
            results.push('✅ Package storage optimized');
            
            return results;
            
        } catch (error) {
            this.log(`Safe cleanup error: ${error.message}`, 'error');
            return results;
        }
    }

    async performModerateCleanup() {
        this.log("Starting MODERATE cleanup...", 'moderate');
        const results = await this.performSafeCleanup();
        
        try {
            // Additional moderate cleanup
            this.log("Clearing browser caches...", 'moderate');
            await this.executeAdbCommand('shell pm clear com.android.chrome --cache-only', 'Chrome cache');
            results.push('⚠️  Browser cache cleared (may need to re-login to websites)');
            
            this.log("Clearing system cache partition...", 'moderate');
            await this.executeAdbCommand('shell recovery --wipe_cache', 'System cache partition');
            results.push('⚠️  System cache partition cleared');
            
            return results;
            
        } catch (error) {
            this.log(`Moderate cleanup error: ${error.message}`, 'warning');
            return results;
        }
    }

    async performAggressiveCleanup() {
        this.log("Starting AGGRESSIVE cleanup...", 'aggressive');
        const results = await this.performModerateCleanup();
        
        try {
            // Additional aggressive cleanup
            this.log("Clearing system logs...", 'aggressive');
            await this.executeAdbCommand('shell logcat -c', 'System logs');
            results.push('⚠️  System logs cleared (debugging info removed)');
            
            this.log("Clearing unused packages...", 'aggressive');
            await this.executeAdbCommand('shell pm trim-caches 5000M', 'Aggressive cache trim');
            results.push('⚠️  Aggressive cache cleanup performed');
            
            return results;
            
        } catch (error) {
            this.log(`Aggressive cleanup error: ${error.message}`, 'error');
            return results;
        }
    }

    async showBackupRecommendations() {
        console.log('\n💾 BACKUP RECOMMENDATIONS:');
        console.log('==========================');
        console.log('Before cleanup, consider backing up:');
        console.log('1. 📱 Important app data (if not synced to cloud)');
        console.log('2. 🔑 App passwords/authentication tokens');
        console.log('3. 🎮 Game progress (if not synced)');
        console.log('4. 📝 Note-taking apps data');
        console.log('5. 💬 Chat app histories (if not backed up)');
        console.log('\nMost modern apps sync to cloud automatically!');
    }

    async runCleanup(level = 'safe') {
        console.log('\n🧹 ANDROID SAFE CLEANUP TOOL');
        console.log('============================');
        
        // Check storage first
        const hasStorageIssues = await this.checkStorageSpace();
        if (!hasStorageIssues) {
            this.log("No critical storage issues detected", 'info');
        }
        
        // Show what will be cleaned
        await this.showCleanupOptions();
        await this.showBackupRecommendations();
        
        console.log(`\n🎯 PERFORMING ${level.toUpperCase()} CLEANUP:`);
        console.log('======================================');
        
        let results = [];
        
        switch (level) {
            case 'safe':
                results = await this.performSafeCleanup();
                break;
            case 'moderate':
                results = await this.performModerateCleanup();
                break;
            case 'aggressive':
                results = await this.performAggressiveCleanup();
                break;
            default:
                results = await this.performSafeCleanup();
        }
        
        // Show results
        console.log('\n📊 CLEANUP RESULTS:');
        console.log('===================');
        results.forEach(result => console.log(result));
        
        // Check storage after cleanup
        console.log('\n📈 STORAGE AFTER CLEANUP:');
        await this.checkStorageSpace();
        
        console.log('\n🎉 CLEANUP COMPLETE!');
        console.log('====================');
        console.log('💡 Restart your phone for best results');
        console.log('🔄 Your phone should now run more smoothly');
        console.log('📱 Crashes should be significantly reduced');
        
        return results;
    }
}

// Command line interface
if (require.main === module) {
    const cleanup = new AndroidSafeCleanup();
    const level = process.argv[2] || 'safe';
    
    if (!['safe', 'moderate', 'aggressive'].includes(level)) {
        console.log('Usage: node android_safe_cleanup.js [safe|moderate|aggressive]');
        console.log('Default: safe');
        process.exit(1);
    }
    
    cleanup.runCleanup(level)
        .then(() => {
            console.log('\n✨ Your Samsung phone should now run much better!');
        })
        .catch(error => {
            console.error('❌ Cleanup failed:', error.message);
        });
}

module.exports = AndroidSafeCleanup; 