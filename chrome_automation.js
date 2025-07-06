#!/usr/bin/env node

// Chrome-specific automation utilities
const { exec } = require('child_process');

class ChromeAutomation {
    constructor() {
        this.appName = "Google Chrome";
    }

    async openURL(url) {
        const appleScript = `
        tell application "Google Chrome"
            activate
            if (count of windows) = 0 then
                make new window
            end if
            set URL of active tab of front window to "${url}"
        end tell
        `;

        return new Promise((resolve, reject) => {
            exec(`osascript -e '${appleScript}'`, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve("URL opened in Chrome");
                }
            });
        });
    }

    async openNewTab(url) {
        const appleScript = `
        tell application "Google Chrome"
            activate
            tell front window
                make new tab with properties {URL:"${url}"}
            end tell
        end tell
        `;

        return new Promise((resolve, reject) => {
            exec(`osascript -e '${appleScript}'`, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve("New tab opened in Chrome");
                }
            });
        });
    }

    async runJavaScript(jsCode) {
        const appleScript = `
        tell application "Google Chrome"
            tell active tab of front window
                execute javascript "${jsCode}"
            end tell
        end tell
        `;

        return new Promise((resolve, reject) => {
            exec(`osascript -e '${appleScript}'`, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout.trim());
                }
            });
        });
    }

    async getPageTitle() {
        const appleScript = `
        tell application "Google Chrome"
            get title of active tab of front window
        end tell
        `;

        return new Promise((resolve, reject) => {
            exec(`osascript -e '${appleScript}'`, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout.trim());
                }
            });
        });
    }

    async getCurrentURL() {
        const appleScript = `
        tell application "Google Chrome"
            get URL of active tab of front window
        end tell
        `;

        return new Promise((resolve, reject) => {
            exec(`osascript -e '${appleScript}'`, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout.trim());
                }
            });
        });
    }

    async closeTab() {
        const appleScript = `
        tell application "Google Chrome"
            close active tab of front window
        end tell
        `;

        return new Promise((resolve, reject) => {
            exec(`osascript -e '${appleScript}'`, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve("Tab closed");
                }
            });
        });
    }
}

module.exports = ChromeAutomation;

// Demo usage if run directly
if (require.main === module) {
    const chrome = new ChromeAutomation();
    
    async function demo() {
        console.log("🌐 Chrome Automation Demo");
        
        try {
            await chrome.openURL("https://www.google.com");
            console.log("✅ Opened Google in Chrome");
            
            setTimeout(async () => {
                const title = await chrome.getPageTitle();
                console.log(`📄 Page title: ${title}`);
                
                const url = await chrome.getCurrentURL();
                console.log(`🔗 Current URL: ${url}`);
                
                await chrome.openNewTab("https://www.youtube.com");
                console.log("✅ Opened YouTube in new tab");
                
            }, 2000);
            
        } catch (error) {
            console.error("❌ Chrome automation error:", error);
        }
    }
    
    demo();
}
