
        const ChromeAutomation = require('./chrome_automation.js');
        const chrome = new ChromeAutomation();
        
        async function test() {
            try {
                await chrome.openURL("https://www.google.com");
                console.log("✅ Chrome automation test successful");
                
                setTimeout(async () => {
                    const title = await chrome.getPageTitle();
                    console.log(`📄 Page title: ${title}`);
                }, 2000);
                
            } catch (error) {
                console.error("❌ Chrome automation test failed:", error);
            }
        }
        
        test();
        