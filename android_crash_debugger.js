#!/usr/bin/env node

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class AndroidCrashDebugger {
    constructor() {
        this.startTime = new Date();
        this.crashLogs = [];
        this.deviceInfo = {};
        this.reportPath = `crash_analysis_${Date.now()}.md`;
    }

    async log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const symbols = { 
            info: '🔍', 
            success: '✅', 
            warning: '⚠️', 
            error: '❌', 
            crash: '💥',
            analysis: '🧠',
            device: '📱'
        };
        console.log(`${symbols[type] || symbols.info} [${timestamp}] ${message}`);
    }

    async executeAdbCommand(command) {
        return new Promise((resolve, reject) => {
            exec(`adb ${command}`, (error, stdout, stderr) => {
                if (error) {
                    reject({ error, stderr });
                } else {
                    resolve(stdout.trim());
                }
            });
        });
    }

    async checkDeviceConnection() {
        this.log("Checking device connection...", 'device');
        
        try {
            const devices = await this.executeAdbCommand('devices');
            const lines = devices.split('\n').filter(line => line.trim() && !line.includes('List of devices'));
            
            if (lines.length === 0) {
                throw new Error('No devices connected');
            }
            
            const deviceLine = lines[0];
            const [deviceId, status] = deviceLine.split('\t');
            
            this.log(`Device found: ${deviceId} (${status})`, 'success');
            
            if (status !== 'device') {
                throw new Error(`Device not ready. Status: ${status}`);
            }
            
            return { deviceId, status };
            
        } catch (error) {
            this.log(`Connection failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async getDeviceInfo() {
        this.log("Collecting device information...", 'device');
        
        try {
            const commands = {
                model: 'shell getprop ro.product.model',
                brand: 'shell getprop ro.product.brand',
                version: 'shell getprop ro.build.version.release',
                sdk: 'shell getprop ro.build.version.sdk',
                manufacturer: 'shell getprop ro.product.manufacturer',
                buildId: 'shell getprop ro.build.id',
                hardware: 'shell getprop ro.hardware',
                uptime: 'shell uptime',
                meminfo: 'shell cat /proc/meminfo | head -10',
                cpuinfo: 'shell cat /proc/cpuinfo | grep -E "(processor|model name|cpu MHz)" | head -10'
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
            this.log(`Device Info: ${info.brand} ${info.model} (Android ${info.version})`, 'success');
            
            return info;
            
        } catch (error) {
            this.log(`Failed to get device info: ${error.message}`, 'error');
            return {};
        }
    }

    async collectCrashLogs() {
        this.log("Collecting crash logs and system information...", 'crash');
        
        try {
            // Clear old logs first
            await this.executeAdbCommand('logcat -c');
            this.log("Cleared old logs, starting fresh collection...", 'info');
            
            // Collect various types of logs
            const logCommands = {
                // Recent crashes
                crashes: 'logcat -d -s AndroidRuntime:E *:F',
                // System errors
                systemErrors: 'logcat -d -s System.err:E *:E',
                // ANR (Application Not Responding)
                anr: 'logcat -d -s ActivityManager:E *:E | grep -i "anr"',
                // Memory issues
                memory: 'logcat -d -s dalvikvm:E *:E | grep -i "memory"',
                // Native crashes
                native: 'logcat -d -s DEBUG:E *:F',
                // Kernel messages
                kernel: 'shell dmesg | tail -100',
                // System services
                services: 'logcat -d -s SystemServer:E *:E',
                // GPU/Graphics issues
                graphics: 'logcat -d -s OpenGLRenderer:E SurfaceFlinger:E *:E'
            };

            const logs = {};
            for (const [type, command] of Object.entries(logCommands)) {
                try {
                    this.log(`Collecting ${type} logs...`, 'info');
                    const result = await this.executeAdbCommand(command);
                    logs[type] = result || 'No logs found';
                } catch (error) {
                    logs[type] = `Error collecting logs: ${error.message}`;
                }
            }

            // Get current running processes
            try {
                logs.processes = await this.executeAdbCommand('shell ps | head -20');
            } catch (error) {
                logs.processes = 'Unable to get process list';
            }

            // Get memory usage
            try {
                logs.memoryUsage = await this.executeAdbCommand('shell cat /proc/meminfo | head -5');
            } catch (error) {
                logs.memoryUsage = 'Unable to get memory info';
            }

            // Get storage info
            try {
                logs.storage = await this.executeAdbCommand('shell df -h');
            } catch (error) {
                logs.storage = 'Unable to get storage info';
            }

            this.crashLogs = logs;
            this.log("Log collection completed", 'success');
            
            return logs;
            
        } catch (error) {
            this.log(`Failed to collect crash logs: ${error.message}`, 'error');
            throw error;
        }
    }

    async analyzeCrashes() {
        this.log("Analyzing crash patterns...", 'analysis');
        
        const analysis = {
            crashCount: 0,
            commonErrors: [],
            memoryIssues: [],
            anrIssues: [],
            nativeCrashes: [],
            recommendations: []
        };

        // Analyze crashes
        if (this.crashLogs.crashes) {
            const crashLines = this.crashLogs.crashes.split('\n').filter(line => line.trim());
            analysis.crashCount = crashLines.length;
            
            // Extract common error patterns
            crashLines.forEach(line => {
                if (line.includes('OutOfMemoryError')) {
                    analysis.memoryIssues.push('Out of Memory Error detected');
                }
                if (line.includes('NullPointerException')) {
                    analysis.commonErrors.push('Null Pointer Exception');
                }
                if (line.includes('IllegalStateException')) {
                    analysis.commonErrors.push('Illegal State Exception');
                }
                if (line.includes('NetworkOnMainThreadException')) {
                    analysis.commonErrors.push('Network on Main Thread');
                }
            });
        }

        // Analyze ANR issues
        if (this.crashLogs.anr) {
            const anrLines = this.crashLogs.anr.split('\n').filter(line => line.trim());
            analysis.anrIssues = anrLines.slice(0, 10); // Top 10 ANR issues
        }

        // Analyze native crashes
        if (this.crashLogs.native) {
            const nativeLines = this.crashLogs.native.split('\n').filter(line => line.trim());
            analysis.nativeCrashes = nativeLines.slice(0, 10); // Top 10 native crashes
        }

        // Generate recommendations
        if (analysis.memoryIssues.length > 0) {
            analysis.recommendations.push('Memory issues detected - consider closing unused apps');
        }
        if (analysis.anrIssues.length > 0) {
            analysis.recommendations.push('ANR issues detected - apps may be hanging');
        }
        if (analysis.nativeCrashes.length > 0) {
            analysis.recommendations.push('Native crashes detected - system-level issues possible');
        }
        if (analysis.crashCount > 20) {
            analysis.recommendations.push('High crash count - device may need factory reset');
        }

        this.log(`Analysis complete: ${analysis.crashCount} crashes found`, 'analysis');
        return analysis;
    }

    async generateReport() {
        this.log("Generating diagnostic report...", 'info');
        
        const analysis = await this.analyzeCrashes();
        const timestamp = new Date().toISOString();
        
        const report = `# Android Crash Debug Report
Generated: ${timestamp}

## 📱 Device Information
- **Model**: ${this.deviceInfo.model || 'Unknown'}
- **Brand**: ${this.deviceInfo.brand || 'Unknown'}
- **Android Version**: ${this.deviceInfo.version || 'Unknown'}
- **SDK Level**: ${this.deviceInfo.sdk || 'Unknown'}
- **Build ID**: ${this.deviceInfo.buildId || 'Unknown'}
- **Hardware**: ${this.deviceInfo.hardware || 'Unknown'}

## 💥 Crash Analysis Summary
- **Total Crashes Found**: ${analysis.crashCount}
- **Memory Issues**: ${analysis.memoryIssues.length}
- **ANR Issues**: ${analysis.anrIssues.length}
- **Native Crashes**: ${analysis.nativeCrashes.length}

## 🔍 Common Error Patterns
${analysis.commonErrors.map(error => `- ${error}`).join('\n') || 'No common patterns detected'}

## 🧠 Memory Issues
${analysis.memoryIssues.map(issue => `- ${issue}`).join('\n') || 'No memory issues detected'}

## ⚠️ ANR (App Not Responding) Issues
\`\`\`
${analysis.anrIssues.join('\n') || 'No ANR issues detected'}
\`\`\`

## 💥 Native Crashes
\`\`\`
${analysis.nativeCrashes.join('\n') || 'No native crashes detected'}
\`\`\`

## 🎯 Recommendations
${analysis.recommendations.map(rec => `- ${rec}`).join('\n') || 'No specific recommendations'}

## 📊 System Information
### Memory Usage
\`\`\`
${this.crashLogs.memoryUsage || 'Not available'}
\`\`\`

### Storage Information
\`\`\`
${this.crashLogs.storage || 'Not available'}
\`\`\`

### Running Processes
\`\`\`
${this.crashLogs.processes || 'Not available'}
\`\`\`

## 🔧 Detailed Logs
### Recent Crashes
\`\`\`
${this.crashLogs.crashes || 'No crash logs found'}
\`\`\`

### System Errors
\`\`\`
${this.crashLogs.systemErrors || 'No system errors found'}
\`\`\`

### Kernel Messages
\`\`\`
${this.crashLogs.kernel || 'No kernel messages available'}
\`\`\`

---
*Report generated by Android Crash Debugger*
        `;

        fs.writeFileSync(this.reportPath, report);
        this.log(`Report saved to: ${this.reportPath}`, 'success');
        
        return { report, analysis };
    }

    async startRealTimeMonitoring() {
        this.log("Starting real-time crash monitoring...", 'crash');
        this.log("Press Ctrl+C to stop monitoring", 'info');
        
        // Start logcat monitoring
        const logcat = spawn('adb', ['logcat', '-s', 'AndroidRuntime:E', '*:F']);
        
        logcat.stdout.on('data', (data) => {
            const lines = data.toString().split('\n');
            lines.forEach(line => {
                if (line.trim()) {
                    this.log(`CRASH DETECTED: ${line}`, 'crash');
                }
            });
        });

        logcat.stderr.on('data', (data) => {
            this.log(`Monitoring error: ${data}`, 'error');
        });

        logcat.on('close', (code) => {
            this.log(`Monitoring stopped (exit code: ${code})`, 'info');
        });

        return logcat;
    }

    async runFullDiagnostic() {
        this.log("🔍 STARTING ANDROID CRASH DIAGNOSTIC", 'crash');
        
        try {
            // Step 1: Check device connection
            await this.checkDeviceConnection();
            
            // Step 2: Get device information
            await this.getDeviceInfo();
            
            // Step 3: Collect crash logs
            await this.collectCrashLogs();
            
            // Step 4: Generate report
            const { report, analysis } = await this.generateReport();
            
            // Step 5: Display summary
            this.log("📊 DIAGNOSTIC COMPLETE", 'success');
            this.log(`Report saved: ${this.reportPath}`, 'success');
            this.log(`Crashes found: ${analysis.crashCount}`, 'info');
            this.log(`Recommendations: ${analysis.recommendations.length}`, 'info');
            
            console.log('\n📋 QUICK SUMMARY:');
            console.log('================');
            console.log(`Device: ${this.deviceInfo.brand} ${this.deviceInfo.model}`);
            console.log(`Android: ${this.deviceInfo.version}`);
            console.log(`Crashes: ${analysis.crashCount}`);
            console.log(`Memory Issues: ${analysis.memoryIssues.length}`);
            console.log(`ANR Issues: ${analysis.anrIssues.length}`);
            console.log('\n💡 TOP RECOMMENDATIONS:');
            analysis.recommendations.slice(0, 3).forEach((rec, i) => {
                console.log(`${i + 1}. ${rec}`);
            });
            
            return { success: true, report, analysis };
            
        } catch (error) {
            this.log(`Diagnostic failed: ${error.message}`, 'error');
            throw error;
        }
    }
}

// Execute diagnostic if run directly
if (require.main === module) {
    const crashDebugger = new AndroidCrashDebugger();
    
    // Check command line arguments
    const args = process.argv.slice(2);
    
    if (args.includes('--monitor')) {
        crashDebugger.startRealTimeMonitoring();
    } else {
        crashDebugger.runFullDiagnostic()
            .then((result) => {
                console.log("\n🎊 DIAGNOSTIC COMPLETED!");
                console.log(`📄 Full report: ${crashDebugger.reportPath}`);
                console.log("🔍 Review the report for detailed analysis");
                console.log("💡 Follow the recommendations to fix crashes");
            })
            .catch((error) => {
                console.error("❌ Diagnostic failed:", error.message);
                process.exit(1);
            });
    }
}

module.exports = AndroidCrashDebugger; 