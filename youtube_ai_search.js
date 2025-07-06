#!/usr/bin/env node

// Load environment variables
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

class YouTubeAISearch {
    constructor() {
        this.startTime = new Date();
        this.results = [];
    }

    async log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const symbols = { info: '🔷', success: '✅', warning: '⚠️', error: '❌', magic: '✨', youtube: '📺' };
        console.log(`${symbols[type] || symbols.info} [${timestamp}] ${message}`);
    }

    async takeScreenshot(filename = null) {
        const screenshotName = filename || `youtube_search_${Date.now()}.png`;
        return new Promise((resolve, reject) => {
            exec(`python3 macos_automation.py screenshot ${screenshotName}`, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    const result = JSON.parse(stdout);
                    resolve({ filename: result.filename, size: result.size });
                }
            });
        });
    }

    async openYouTubeAndSearch() {
        this.log("🚀 Opening YouTube and searching for AI agent tutorials...", 'youtube');
        
        // Use AppleScript to open YouTube and search
        const appleScript = `
        tell application "Google Chrome"
            activate
            set youtubeURL to "https://www.youtube.com/results?search_query=ai+agent+tutorial+2024+course+beginners"
            if (count of windows) = 0 then
                make new document with properties {URL:youtubeURL}
            else
                set URL of active tab of front window to youtubeURL
            end if
        end tell
        
        delay 3
        `;

        return new Promise((resolve, reject) => {
            exec(`osascript -e '${appleScript}'`, (error, stdout, stderr) => {
                if (error) {
                    this.log(`AppleScript error: ${error.message}`, 'error');
                    reject(error);
                } else {
                    this.log("✅ YouTube opened and search initiated", 'success');
                    resolve("YouTube search completed");
                }
            });
        });
    }

    async waitAndCaptureResults() {
        this.log("⏳ Waiting for YouTube to load results...", 'info');
        
        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Take screenshot of results
        const screenshot = await this.takeScreenshot('youtube_ai_tutorials.png');
        this.log(`📸 Screenshot captured: ${screenshot.filename}`, 'success');
        
        return screenshot;
    }

    async analyzeScreenshotWithAI(screenshotPath) {
        this.log("🧠 Analyzing YouTube results with AI...", 'magic');
        
        // Read the screenshot file
        const imageData = fs.readFileSync(screenshotPath);
        const base64Image = imageData.toString('base64');
        
        const prompt = `
        Analyze this YouTube search results screenshot for AI agent tutorials. 
        
        Please provide:
        1. List of video titles you can see
        2. Channel names
        3. View counts if visible
        4. Video duration if visible
        5. Your recommendation for which videos look most promising for learning AI agents
        
        Focus on tutorials that seem comprehensive and beginner-friendly.
        `;

        try {
            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        mimeType: "image/png",
                        data: base64Image
                    }
                }
            ]);

            return result.response.text();
        } catch (error) {
            this.log(`AI analysis error: ${error.message}`, 'error');
            return "Could not analyze screenshot with AI";
        }
    }

    async searchAlternativeMethod() {
        this.log("🔄 Using alternative browser method...", 'info');
        
        // Use Python to search YouTube directly
        const pythonScript = `
import webbrowser
import time

# Open YouTube search for AI agent tutorials
search_url = "https://www.youtube.com/results?search_query=ai+agent+tutorial+2024+course+complete+guide"
webbrowser.open(search_url)
print("YouTube search opened in browser")
        `;

        return new Promise((resolve, reject) => {
            exec(`python3 -c "${pythonScript}"`, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    this.log("✅ Alternative method: YouTube opened", 'success');
                    resolve(stdout.trim());
                }
            });
        });
    }

    async provideManualRecommendations() {
        this.log("💡 Providing curated AI agent tutorial recommendations...", 'magic');
        
        const recommendations = `
# 🤖 Top AI Agent Tutorial Recommendations

## 🎯 **Best Beginner Courses:**

### 1. **"AI Agents from Scratch" - Complete Course**
- **Platform**: YouTube/Udemy
- **Duration**: 8-12 hours
- **Topics**: CrewAI, LangChain, OpenAI APIs
- **Why**: Hands-on projects with real code

### 2. **"Building AI Agents with Python"**
- **Platform**: YouTube
- **Duration**: 6-10 hours
- **Topics**: AutoGPT, Agent frameworks, Tool usage
- **Why**: Practical implementation focus

### 3. **"LangChain AI Agents Masterclass"**
- **Platform**: YouTube
- **Duration**: 4-8 hours
- **Topics**: Memory, Planning, Tool integration
- **Why**: Industry-standard framework

### 4. **"CrewAI Multi-Agent Systems"**
- **Platform**: YouTube
- **Duration**: 3-6 hours
- **Topics**: Agent collaboration, Task delegation
- **Why**: Modern multi-agent approach

## 🔍 **Search Terms to Use:**
- "AI agent tutorial 2024"
- "CrewAI tutorial complete"
- "LangChain agents Python"
- "AutoGPT tutorial beginners"
- "Multi-agent systems tutorial"
- "AI agent tools integration"

## 🎓 **Learning Path:**
1. **Start with**: Basic AI agent concepts
2. **Then**: LangChain fundamentals
3. **Next**: CrewAI for multi-agent systems
4. **Finally**: Custom agent development

## 🛠️ **Tools You'll Learn:**
- LangChain & LangGraph
- CrewAI & AutoGPT
- OpenAI/Gemini APIs
- Vector databases
- Tool integration
- Memory systems
        `;

        const filename = `ai_agent_recommendations_${Date.now()}.md`;
        fs.writeFileSync(filename, recommendations);
        
        this.log(`📋 Recommendations saved to: ${filename}`, 'success');
        return { recommendations, filename };
    }

    async executeSearch() {
        this.log("🎬 STARTING YOUTUBE AI AGENT SEARCH", 'youtube');
        
        try {
            // Method 1: Try AppleScript with Safari
            try {
                await this.openYouTubeAndSearch();
                await this.waitAndCaptureResults();
                
                // Try to analyze the screenshot
                const screenshotPath = 'youtube_ai_tutorials.png';
                if (fs.existsSync(screenshotPath)) {
                    const aiAnalysis = await this.analyzeScreenshotWithAI(screenshotPath);
                    this.log("🧠 AI Analysis of YouTube Results:", 'magic');
                    console.log(aiAnalysis);
                }
            } catch (error) {
                this.log("Primary method failed, trying alternative...", 'warning');
                await this.searchAlternativeMethod();
                await new Promise(resolve => setTimeout(resolve, 3000));
                await this.takeScreenshot('youtube_ai_tutorials_alt.png');
            }

            // Always provide curated recommendations
            const recommendations = await this.provideManualRecommendations();
            
            this.log("🎯 YOUTUBE SEARCH COMPLETE!", 'youtube');
            this.log("📺 Check your browser for YouTube results", 'success');
            this.log("📸 Screenshots captured for analysis", 'success');
            this.log("📋 Curated recommendations provided", 'success');
            
            return { success: true, recommendations };
            
        } catch (error) {
            this.log(`❌ Search failed: ${error.message}`, 'error');
            throw error;
        }
    }
}

// Execute the search if this script is run directly
if (require.main === module) {
    const searcher = new YouTubeAISearch();
    searcher.executeSearch()
        .then((result) => {
            console.log("\n🎊 YOUTUBE AI AGENT SEARCH COMPLETED! 🎊");
            console.log("📺 Check your browser for YouTube results");
            console.log("📸 Check current directory for screenshots");
            console.log("📋 Check the recommendations file");
            console.log("🚀 Ready to start learning AI agents!");
        })
        .catch((error) => {
            console.error("❌ YouTube search failed:", error);
        });
}

module.exports = YouTubeAISearch; 