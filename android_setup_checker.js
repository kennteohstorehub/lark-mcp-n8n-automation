#!/usr/bin/env node

const { exec } = require('child_process');

class AndroidSetupChecker {
    async log(message, type = 'info') {
        const symbols = { info: '🔷', success: '✅', warning: '⚠️', error: '❌', step: '📋' };
        console.log(`${symbols[type]} ${message}`);
    }

    async checkAdb() {
        this.log("Checking if ADB is installed...", 'step');
        
        return new Promise((resolve) => {
            exec('adb version', (error, stdout, stderr) => {
                if (error) {
                    this.log("ADB not found. Please install Android SDK Platform Tools", 'error');
                    resolve(false);
                } else {
                    this.log("ADB is installed and working", 'success');
                    console.log(`   Version: ${stdout.split('\n')[0]}`);
                    resolve(true);
                }
            });
        });
    }

    async checkDevices() {
        this.log("Checking for connected devices...", 'step');
        
        return new Promise((resolve) => {
            exec('adb devices', (error, stdout, stderr) => {
                if (error) {
                    this.log("Cannot check devices", 'error');
                    resolve(false);
                } else {
                    const lines = stdout.split('\n').filter(line => line.trim() && !line.includes('List of devices'));
                    
                    if (lines.length === 0) {
                        this.log("No devices found", 'warning');
                        resolve(false);
                    } else {
                        this.log(`Found ${lines.length} device(s):`, 'success');
                        lines.forEach(line => {
                            const [deviceId, status] = line.split('\t');
                            console.log(`   📱 ${deviceId} - ${status}`);
                        });
                        resolve(true);
                    }
                }
            });
        });
    }

    async runSetupCheck() {
        console.log('\n🔍 ANDROID SETUP CHECKER');
        console.log('========================\n');
        
        const adbInstalled = await this.checkAdb();
        const devicesConnected = await this.checkDevices();
        
        console.log('\n📋 SETUP STATUS:');
        console.log('================');
        console.log(`ADB Installed: ${adbInstalled ? '✅ Yes' : '❌ No'}`);
        console.log(`Device Connected: ${devicesConnected ? '✅ Yes' : '❌ No'}`);
        
        if (!adbInstalled) {
            console.log('\n💡 TO INSTALL ADB:');
            console.log('==================');
            console.log('macOS: brew install android-platform-tools');
            console.log('Windows: Download from https://developer.android.com/studio/releases/platform-tools');
            console.log('Linux: sudo apt install android-tools-adb');
        }
        
        if (!devicesConnected) {
            console.log('\n📱 TO CONNECT YOUR DEVICE:');
            console.log('==========================');
            console.log('1. Enable Developer Options:');
            console.log('   Settings → About Phone → Tap "Build Number" 7 times');
            console.log('2. Enable USB Debugging:');
            console.log('   Settings → Developer Options → USB Debugging (ON)');
            console.log('3. Connect via USB cable');
            console.log('4. Select "File Transfer" mode');
            console.log('5. Accept debugging prompt on your phone');
            console.log('6. Run: adb devices');
        }
        
        if (adbInstalled && devicesConnected) {
            console.log('\n🎉 READY TO DEBUG!');
            console.log('==================');
            console.log('Your setup is complete. You can now run:');
            console.log('• node android_crash_debugger.js (Full diagnostic)');
            console.log('• node android_crash_debugger.js --monitor (Real-time monitoring)');
        }
        
        return adbInstalled && devicesConnected;
    }
}

// Run checker
const checker = new AndroidSetupChecker();
checker.runSetupCheck(); 