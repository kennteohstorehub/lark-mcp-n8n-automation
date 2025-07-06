# 🚀 Ultimate MCP Setup for Cursor Pro + Gemini Pro

A comprehensive Model Context Protocol (MCP) setup that supercharges your Cursor Pro experience with powerful automation, browser control, and AI integration.

## 🎯 What You Get

### **Browser Automation & Screenshots**
- **Playwright Integration**: Full browser control, screenshots, form filling
- **Web Scraping**: Extract data from any website
- **Visual Testing**: Automated UI testing and interaction

### **macOS System Control**
- **GUI Automation**: Click, type, screenshot any Mac application
- **AppleScript Integration**: Native macOS automation
- **System Information**: Screen size, mouse position, window management

### **AI-Powered Integration**
- **Gemini Pro Client**: Direct integration with Google's most advanced AI
- **Function Calling**: AI can intelligently use all your tools
- **Multi-Tool Workflows**: Combine multiple MCP servers for complex tasks

### **Productivity Powerhouses**
- **Gmail Automation**: Auto-authentication and email management
- **File System Access**: Local file operations and management
- **National Parks API**: Real-time information about US National Parks

## 🏗️ Architecture

```
Cursor Pro ←→ MCP Servers ←→ Real-World APIs
     ↓              ↓              ↓
  Your Code    Automation    External Data
     ↓              ↓              ↓
  AI Tools    Screenshots   Live Information
```

## 📋 Installation Status

✅ **Playwright MCP Server** - Microsoft's official browser automation  
✅ **ExecuteAutomation Playwright** - Enhanced browser automation  
✅ **Firecrawl Web Scraping** - Intelligent web content extraction  
✅ **Gmail Auto-Auth** - Seamless email integration  
✅ **National Parks API** - US National Parks information  
✅ **Filesystem Local** - Local file system operations  
✅ **macOS GUI Control** - Custom Python-based system automation  
✅ **MCP Proxy** - Remote MCP server support  

## 🚀 Quick Start

### 1. **Setup API Keys**

Copy the environment template:
```bash
cp env-template.txt .env
```

Edit `.env` and add your keys:
```bash
# Required
GEMINI_API_KEY=your-gemini-api-key-here

# Optional
FIRECRAWL_API_KEY=your-firecrawl-api-key-here
NPS_API_KEY=your-nps-api-key-here
```

**Get API Keys:**
- **Gemini Pro**: https://makersuite.google.com/app/apikey
- **Firecrawl**: https://firecrawl.dev/
- **National Parks**: https://www.nps.gov/subjects/developer/api-documentation.htm

### 2. **Verify Cursor Configuration**

Your Cursor MCP configuration is already set up at `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "playwright-browser-automation": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"]
    },
    "firecrawl-web-scraping": {
      "command": "npx", 
      "args": ["-y", "firecrawl-mcp"]
    },
    "gmail-automation": {
      "command": "npx",
      "args": ["-y", "@gongrzhe/server-gmail-autoauth-mcp"]
    },
    "macos-gui-control": {
      "command": "python3",
      "args": ["/Users/kennteoh/Development/MCP/macos_automation.py"]
    }
  }
}
```

### 3. **Test Gemini Integration**

Run the standalone Gemini MCP client:
```bash
node gemini-mcp-client.js
```

This will:
- Connect to all your MCP servers
- Load available tools
- Start an interactive chat with Gemini Pro
- Allow AI to intelligently use your tools

## 🎮 Usage Examples

### **In Cursor**

Ask Cursor to do complex tasks:

```
"Take a screenshot of the current screen and analyze what's visible"
"Open a browser, navigate to GitHub, and take a screenshot"
"Search for national parks in California and create a summary"
"Check my Gmail for recent emails and summarize them"
```

### **In Gemini MCP Client**

Interactive AI automation:

```bash
🗣️ You: Take a screenshot and describe what you see
🤖 Gemini: [Takes screenshot] I can see your desktop with...

🗣️ You: Open a browser and search for "MCP servers"
🤖 Gemini: [Opens browser, navigates, takes screenshot] I found...

🗣️ You: Type "Hello World" in the current text field
🤖 Gemini: [Types text] I've typed "Hello World" for you
```

### **macOS Automation**

Direct system control:

```bash
# Take screenshot
python3 macos_automation.py screenshot my_screen.png

# Click at coordinates
python3 macos_automation.py click 100 200

# Type text
python3 macos_automation.py type "Hello, World!"

# Run AppleScript
python3 macos_automation.py applescript 'tell application "Finder" to activate'
```

## 🔧 Available Tools

### **Browser Automation**
- `goto` - Navigate to URLs
- `click` - Click elements
- `type` - Fill forms
- `screenshot` - Capture pages
- `extract_text` - Get page content

### **System Control**
- `take_screenshot` - Screen capture
- `click_at` - Mouse control
- `type_text` - Keyboard input
- `press_key` - Key presses
- `get_screen_info` - System info
- `run_applescript` - macOS scripting

### **Web Scraping**
- `scrape_url` - Extract structured data
- `crawl_site` - Multi-page crawling
- `extract_links` - Get all links
- `get_metadata` - Page information

### **Email & Productivity**
- `list_emails` - Get inbox contents
- `send_email` - Send messages
- `read_file` - File operations
- `write_file` - Save content

## 🎯 Advanced Workflows

### **Web Research + Documentation**
```
1. AI scrapes multiple websites
2. Takes screenshots of key pages
3. Extracts structured data
4. Creates comprehensive report
5. Saves to local files
```

### **Automated Testing**
```
1. AI opens your web application
2. Takes baseline screenshots
3. Performs user interactions
4. Captures results
5. Compares with expected behavior
```

### **Content Creation**
```
1. AI researches topics online
2. Gathers images and data
3. Writes content
4. Formats and saves locally
5. Can even open design tools
```

## 🛠️ Troubleshooting

### **MCP Server Won't Start**
```bash
# Check if all packages are installed
npm list -g | grep mcp

# Reinstall if needed
npm install -g @playwright/mcp firecrawl-mcp
```

### **Python Script Issues**
```bash
# Check Python packages
python3 -c "import pyautogui, pynput; print('✅ All packages installed')"

# Reinstall if needed
python3 -m pip install --user pyautogui pynput pillow
```

### **Cursor Not Seeing MCP Servers**
1. Restart Cursor completely
2. Check `~/.cursor/mcp.json` exists
3. Verify file paths are correct
4. Check terminal for error messages

### **Gemini API Issues**
1. Verify API key is correct
2. Check quota limits
3. Ensure `.env` file is loaded

## 🎉 What's Next?

Your setup is now complete! You can:

1. **Start using Cursor** with all MCP servers enabled
2. **Run the Gemini client** for standalone AI automation
3. **Combine tools** for complex workflows
4. **Add more MCP servers** as needed

## 📚 Resources

- **MCP Documentation**: https://docs.anthropic.com/mcp/
- **Cursor MCP Guide**: https://docs.cursor.com/mcp/
- **Gemini API Docs**: https://ai.google.dev/docs
- **Playwright Docs**: https://playwright.dev/

---

**🎊 Congratulations!** You now have the most powerful MCP setup for productivity and automation on macOS. Your AI tools can now take screenshots, control browsers, automate tasks, and interact with the real world through a unified interface.

**Ready to supercharge your workflow? Start with a simple command in Cursor:**

*"Take a screenshot and help me organize my desktop"* 

# 🚀 Lark Suite MCP Integration with n8n

[![GitHub release](https://img.shields.io/github/release/kennteohstorehub/lark-mcp-n8n-automation.svg)](https://github.com/kennteohstorehub/lark-mcp-n8n-automation/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io/)
[![n8n Integration](https://img.shields.io/badge/n8n-Integration-red.svg)](https://n8n.io/)
[![Lark Suite](https://img.shields.io/badge/Lark-Suite-orange.svg)](https://larksuite.com/)

This repository contains tools and guides for integrating **Lark Suite** (ByteDance's collaboration platform) with **MCP (Model Context Protocol)** and **n8n** for powerful AI automation workflows.

## 📱 What's Included

- **Comprehensive Integration Guide** (`lark_suite_mcp_integration_guide.md`)
- **Ready-to-use MCP Server** (`lark_mcp_server_example.js`)
- **Automated Setup Script** (`setup.js`)
- **Complete Documentation** with examples and best practices

## 🎯 Features

### Lark Suite Integration
- ✅ **Lark Messenger** - Send messages, create bots
- ✅ **Lark Base** - Database operations, record management
- ✅ **Lark Docs** - Document creation and processing
- ✅ **Lark Calendar** - Meeting scheduling and management
- ✅ **Lark Video** - Meeting automation

### MCP & n8n Integration
- ✅ **AI-powered workflows** with natural language
- ✅ **Custom MCP server** for Lark tools
- ✅ **n8n workflow templates** for common tasks
- ✅ **Claude Desktop integration** ready-to-use

## 🚀 Quick Start

### 1. **Clone and Setup**
```bash
git clone <repository-url>
cd lark-mcp-integration
npm install
npm run setup
```

### 2. **Configure Lark App**
1. Go to [Lark Open Platform](https://open.larksuite.com/)
2. Create a new custom app
3. Get your App ID and App Secret
4. Configure required permissions

### 3. **Start MCP Server**
```bash
# Start the server
npm start

# Or for development
npm run dev
```

### 4. **Connect with Claude Desktop**
Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "lark-automation": {
      "command": "node",
      "args": ["path/to/lark_mcp_server_example.js"],
      "env": {
        "LARK_APP_ID": "your_app_id",
        "LARK_APP_SECRET": "your_app_secret"
      }
    }
  }
}
```

## 📚 Documentation

### Core Files
- **`lark_suite_mcp_integration_guide.md`** - Complete integration guide
- **`lark_mcp_server_example.js`** - MCP server implementation
- **`setup.js`** - Interactive setup wizard
- **`package.json`** - Dependencies and scripts

### Key Features Documentation

#### Available MCP Tools
- `send_lark_message` - Send messages to chats/users
- `create_lark_base_record` - Create database records
- `search_lark_messages` - Search chat history
- `create_lark_document` - Create documents
- `schedule_lark_calendar_event` - Schedule meetings

#### n8n Integration
- MCP Server Trigger nodes
- Lark-specific workflow templates
- AI agent configurations
- Custom tool implementations

## 🔧 Configuration

### Environment Variables
```bash
# Lark App Configuration
LARK_APP_ID=cli_your_app_id
LARK_APP_SECRET=your_app_secret
LARK_DOMAIN=https://open.larksuite.com

# Server Configuration
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# Optional Test Configuration
TEST_CHAT_ID=your_test_chat_id
TEST_USER_EMAIL=test@example.com
```

### Required Lark API Permissions
```javascript
const REQUIRED_SCOPES = [
  'im:message',              // Send/receive messages
  'im:message.group_at_msg', // Group mentions
  'bitable:app',             // Lark Base operations
  'docx:document',           // Document access
  'calendar:calendar',       // Calendar access
  'contact:user.id:readonly' // User information
];
```

## 💡 Example Use Cases

### 1. **AI Customer Support**
```yaml
Trigger: New message in support channel
Actions:
  - Analyze sentiment with AI
  - Search knowledge base
  - Generate response
  - Create ticket in Lark Base
  - Route to team member
```

### 2. **Smart Meeting Assistant**
```yaml
Trigger: Calendar event starts
Actions:
  - Send pre-meeting brief
  - Gather context from docs
  - Create meeting notes
  - Schedule follow-ups
```

### 3. **Document Intelligence**
```yaml
Trigger: Document shared
Actions:
  - Extract key insights with AI
  - Create summary document
  - Update project tracker
  - Notify stakeholders
```

## 🛠️ Development

### Scripts
```bash
npm start      # Start production server
npm run dev    # Start development server
npm test       # Run tests
npm run setup  # Run setup wizard
```

### Project Structure
```
├── lark_suite_mcp_integration_guide.md  # Complete guide
├── lark_mcp_server_example.js           # MCP server
├── setup.js                             # Setup wizard
├── package.json                         # Dependencies
├── .env                                 # Configuration
└── README.md                           # This file
```

## 📊 Architecture

```
AI Agent (Claude) → MCP Client → n8n → Lark API Gateway
                                   ↓
                    Lark Messenger + Base + Docs + Calendar
```

## 🔒 Security

- **Token Management**: Automatic token rotation
- **API Rate Limiting**: Built-in request throttling
- **Error Handling**: Comprehensive error mapping
- **Authentication**: Bearer token support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Resources

### Official Documentation
- [Lark Open Platform](https://open.larksuite.com/document)
- [n8n Documentation](https://docs.n8n.io/)
- [MCP Specification](https://spec.modelcontextprotocol.io/)

### Community
- [n8n Community Forum](https://community.n8n.io/)
- [Lark Developer Community](https://open.larksuite.com/community)
- [MCP GitHub](https://github.com/modelcontextprotocol)

## 🎉 Get Started

Ready to revolutionize your team's productivity? Start with the **Quick Start** section above and check out the comprehensive guide in `lark_suite_mcp_integration_guide.md`.

**Questions?** Open an issue or check the documentation links above.

**Happy Automating!** 🚀 