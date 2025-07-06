#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🧪 Testing MCP Setup...\n');

// Test 1: Check if Cursor MCP config exists
console.log('1️⃣ Checking Cursor MCP Configuration...');
const cursorConfigPath = path.join(process.env.HOME, '.cursor', 'mcp.json');
if (fs.existsSync(cursorConfigPath)) {
    console.log('✅ Cursor MCP config found at ~/.cursor/mcp.json');
    const config = JSON.parse(fs.readFileSync(cursorConfigPath, 'utf8'));
    console.log(`   📊 Found ${Object.keys(config.mcpServers).length} MCP servers configured`);
} else {
    console.log('❌ Cursor MCP config not found');
}

// Test 2: Check if Node.js packages are installed
console.log('\n2️⃣ Checking Node.js Dependencies...');
const requiredPackages = [
    '@playwright/mcp',
    '@executeautomation/playwright-mcp-server',
    'firecrawl-mcp',
    '@gongrzhe/server-gmail-autoauth-mcp',
    'mcp-server-nationalparks',
    '@modelcontextprotocol/server-filesystem'
];

for (const pkg of requiredPackages) {
    try {
        const result = spawn('npm', ['list', '-g', pkg], { 
            stdio: 'pipe',
            timeout: 5000 
        });
        
        result.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${pkg} installed`);
            } else {
                console.log(`❌ ${pkg} not found`);
            }
        });
    } catch (error) {
        console.log(`❌ ${pkg} check failed: ${error.message}`);
    }
}

// Test 3: Check Python dependencies
console.log('\n3️⃣ Checking Python Dependencies...');
const pythonPackages = ['pyautogui', 'pynput', 'pillow'];

for (const pkg of pythonPackages) {
    try {
        const result = spawn('python3', ['-c', `import ${pkg}; print("✅ ${pkg} available")`], {
            stdio: 'pipe',
            timeout: 5000
        });
        
        result.stdout.on('data', (data) => {
            console.log(data.toString().trim());
        });
        
        result.stderr.on('data', (data) => {
            console.log(`❌ ${pkg} error: ${data.toString().trim()}`);
        });
    } catch (error) {
        console.log(`❌ ${pkg} check failed`);
    }
}

// Test 4: Check if macOS automation script works
console.log('\n4️⃣ Testing macOS Automation Script...');
if (fs.existsSync('./macos_automation.py')) {
    console.log('✅ macOS automation script found');
    
    // Test the info command
    const testProcess = spawn('python3', ['./macos_automation.py', 'info'], {
        stdio: 'pipe',
        timeout: 10000
    });
    
    testProcess.stdout.on('data', (data) => {
        try {
            const result = JSON.parse(data.toString());
            if (result.screen_size) {
                console.log(`✅ Screen automation working - Size: ${result.screen_size.width}x${result.screen_size.height}`);
            }
        } catch (error) {
            console.log('⚠️  Script output not in expected format');
        }
    });
    
    testProcess.stderr.on('data', (data) => {
        console.log(`❌ Script error: ${data.toString().trim()}`);
    });
} else {
    console.log('❌ macOS automation script not found');
}

// Test 5: Check environment setup
console.log('\n5️⃣ Checking Environment Setup...');
if (fs.existsSync('.env')) {
    console.log('✅ .env file found');
    const envContent = fs.readFileSync('.env', 'utf8');
    if (envContent.includes('GEMINI_API_KEY')) {
        console.log('✅ GEMINI_API_KEY configured');
    } else {
        console.log('⚠️  GEMINI_API_KEY not found in .env');
    }
} else {
    console.log('⚠️  .env file not found - copy env-template.txt to .env and add your API keys');
}

console.log('\n🎯 Test Summary:');
console.log('- If all items show ✅, your setup is complete!');
console.log('- ⚠️  items are optional but recommended');
console.log('- ❌ items need attention');

console.log('\n🚀 Next Steps:');
console.log('1. Copy env-template.txt to .env and add your Gemini API key');
console.log('2. Restart Cursor to load MCP servers');
console.log('3. Run: node gemini-mcp-client.js to test Gemini integration');
console.log('4. In Cursor, try: "Take a screenshot and describe what you see"');

console.log('\n🎉 Setup Complete! Check the README.md for usage examples.'); 