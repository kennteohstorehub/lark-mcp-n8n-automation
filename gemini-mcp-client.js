#!/usr/bin/env node

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { spawn } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class GeminiMCPClient {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        this.mcpClients = new Map();
        this.availableTools = new Map();
        this.setupReadline();
    }

    setupReadline() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async loadMCPServers() {
        const configPath = path.join(process.env.HOME, '.cursor', 'mcp.json');
        
        if (!fs.existsSync(configPath)) {
            console.log('❌ No MCP configuration found at ~/.cursor/mcp.json');
            return;
        }

        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log('🔧 Loading MCP servers...');

        for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
            try {
                console.log(`📡 Connecting to ${serverName}...`);
                await this.connectToMCPServer(serverName, serverConfig);
                console.log(`✅ Connected to ${serverName}`);
            } catch (error) {
                console.log(`❌ Failed to connect to ${serverName}:`, error.message);
            }
        }

        console.log(`\n🎯 Total MCP servers connected: ${this.mcpClients.size}`);
        console.log(`🔨 Total tools available: ${this.availableTools.size}`);
    }

    async connectToMCPServer(serverName, serverConfig) {
        const process = spawn(serverConfig.command, serverConfig.args, {
            env: { ...process.env, ...serverConfig.env },
            stdio: ['pipe', 'pipe', 'pipe']
        });

        const transport = new StdioClientTransport({
            reader: process.stdout,
            writer: process.stdin
        });

        const client = new Client({
            name: `gemini-mcp-${serverName}`,
            version: "1.0.0"
        }, {
            capabilities: {
                tools: {}
            }
        });

        await client.connect(transport);
        
        // Get available tools
        const result = await client.listTools();
        
        for (const tool of result.tools) {
            this.availableTools.set(tool.name, {
                serverName,
                tool,
                client
            });
        }

        this.mcpClients.set(serverName, client);
    }

    formatToolsForGemini() {
        const tools = [];
        
        for (const [toolName, toolInfo] of this.availableTools.entries()) {
            const tool = toolInfo.tool;
            const functionDeclaration = {
                name: tool.name,
                description: tool.description,
                parameters: {
                    type: "object",
                    properties: {},
                    required: []
                }
            };

            // Convert inputSchema to Gemini format
            if (tool.inputSchema && tool.inputSchema.properties) {
                functionDeclaration.parameters.properties = tool.inputSchema.properties;
                functionDeclaration.parameters.required = tool.inputSchema.required || [];
            }

            tools.push({ functionDeclarations: [functionDeclaration] });
        }

        return tools;
    }

    async callMCPTool(toolName, args) {
        const toolInfo = this.availableTools.get(toolName);
        if (!toolInfo) {
            throw new Error(`Tool ${toolName} not found`);
        }

        console.log(`🔧 Calling ${toolName} with args:`, args);
        
        try {
            const result = await toolInfo.client.callTool({
                name: toolName,
                arguments: args
            });

            return result;
        } catch (error) {
            console.error(`❌ Error calling ${toolName}:`, error);
            throw error;
        }
    }

    async chat(message) {
        const tools = this.formatToolsForGemini();
        
        console.log(`🤖 Processing: "${message}"`);
        
        try {
            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: message }] }],
                tools: tools
            });

            const response = await result.response;
            
            // Check if Gemini wants to call any tools
            if (response.functionCalls && response.functionCalls.length > 0) {
                console.log(`\n🛠️  Gemini wants to call ${response.functionCalls.length} tool(s):`);
                
                const toolResults = [];
                
                for (const functionCall of response.functionCalls) {
                    console.log(`\n📞 Calling: ${functionCall.name}`);
                    console.log(`📋 Args:`, functionCall.args);
                    
                    try {
                        const toolResult = await this.callMCPTool(functionCall.name, functionCall.args);
                        toolResults.push({
                            functionResponse: {
                                name: functionCall.name,
                                response: toolResult
                            }
                        });
                        
                        console.log(`✅ Tool result:`, toolResult);
                    } catch (error) {
                        console.log(`❌ Tool error:`, error.message);
                        toolResults.push({
                            functionResponse: {
                                name: functionCall.name,
                                response: { error: error.message }
                            }
                        });
                    }
                }
                
                // Send tool results back to Gemini for final response
                const finalResult = await this.model.generateContent({
                    contents: [
                        { role: 'user', parts: [{ text: message }] },
                        { role: 'model', parts: response.functionCalls.map(fc => ({ functionCall: fc })) },
                        { role: 'user', parts: toolResults }
                    ]
                });
                
                const finalResponse = await finalResult.response;
                return finalResponse.text();
            } else {
                return response.text();
            }
        } catch (error) {
            console.error('❌ Error in chat:', error);
            return `Error: ${error.message}`;
        }
    }

    async startInteractiveChat() {
        console.log('\n🎉 Gemini MCP Client Ready!');
        console.log('💬 Type your messages (or "exit" to quit)');
        console.log('🔧 Available tools:', Array.from(this.availableTools.keys()).join(', '));
        console.log('\n' + '='.repeat(50));

        const askQuestion = () => {
            this.rl.question('\n🗣️  You: ', async (input) => {
                if (input.toLowerCase() === 'exit') {
                    console.log('\n👋 Goodbye!');
                    process.exit(0);
                }

                if (input.toLowerCase() === 'tools') {
                    console.log('\n🔧 Available tools:');
                    for (const [toolName, toolInfo] of this.availableTools.entries()) {
                        console.log(`  • ${toolName} (${toolInfo.serverName}): ${toolInfo.tool.description}`);
                    }
                    askQuestion();
                    return;
                }

                const response = await this.chat(input);
                console.log('\n🤖 Gemini:', response);
                
                askQuestion();
            });
        };

        askQuestion();
    }

    async cleanup() {
        for (const client of this.mcpClients.values()) {
            await client.close();
        }
        this.rl.close();
    }
}

// Main execution
async function main() {
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ Please set GEMINI_API_KEY environment variable');
        process.exit(1);
    }

    const client = new GeminiMCPClient();
    
    // Handle cleanup on exit
    process.on('SIGINT', async () => {
        console.log('\n\n🧹 Cleaning up...');
        await client.cleanup();
        process.exit(0);
    });

    try {
        await client.loadMCPServers();
        await client.startInteractiveChat();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
} 