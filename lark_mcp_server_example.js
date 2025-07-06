
/**
 * Lark MCP Server Example
 * Connects Lark Suite (ByteDance) with MCP for AI automation
 * Works with n8n workflows and Claude Desktop
 */

// Note: These packages are placeholders for the actual MCP and Lark SDK
// const { McpServer } = require('@modelcontextprotocol/server');
// const { LarkApiClient } = require('@lark/node-sdk');
const express = require('express');
const cors = require('cors');

class LarkMCPServer {
  constructor(config) {
    this.config = config;
    // Placeholder for actual Lark SDK client
    this.larkClient = {
      // Mock client for demonstration
      appId: config.larkAppId,
      appSecret: config.larkAppSecret,
      domain: config.domain || 'https://open.larksuite.com'
    };
    
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupMCPTools();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', service: 'lark-mcp-server' });
    });

    // MCP endpoint
    this.app.post('/mcp', async (req, res) => {
      try {
        const result = await this.handleMCPRequest(req.body);
        res.json(result);
      } catch (error) {
        console.error('MCP request error:', error);
        res.status(500).json({ 
          error: error.message,
          code: error.code || 'INTERNAL_ERROR'
        });
      }
    });
  }

  async setupMCPTools() {
    this.tools = {
      // Send message to Lark chat
      send_lark_message: {
        name: 'send_lark_message',
        description: 'Send a message to a Lark chat or user',
        inputSchema: {
          type: 'object',
          properties: {
            chatId: { 
              type: 'string', 
              description: 'Chat ID or user email' 
            },
            message: { 
              type: 'string', 
              description: 'Message content' 
            },
            messageType: { 
              type: 'string', 
              enum: ['text', 'post', 'card'],
              default: 'text',
              description: 'Type of message to send'
            }
          },
          required: ['chatId', 'message']
        }
      },

      // Create record in Lark Base
      create_lark_base_record: {
        name: 'create_lark_base_record',
        description: 'Create a new record in Lark Base (database)',
        inputSchema: {
          type: 'object',
          properties: {
            appToken: { 
              type: 'string', 
              description: 'Lark Base app token' 
            },
            tableId: { 
              type: 'string', 
              description: 'Table ID within the app' 
            },
            fields: { 
              type: 'object', 
              description: 'Field values for the new record'
            }
          },
          required: ['appToken', 'tableId', 'fields']
        }
      },

      // Search Lark messages
      search_lark_messages: {
        name: 'search_lark_messages',
        description: 'Search for messages in Lark chats',
        inputSchema: {
          type: 'object',
          properties: {
            query: { 
              type: 'string', 
              description: 'Search query' 
            },
            chatId: { 
              type: 'string', 
              description: 'Chat ID to search in (optional)' 
            },
            timeRange: { 
              type: 'string', 
              enum: ['1d', '7d', '30d', '90d'],
              default: '7d',
              description: 'Time range for search'
            }
          },
          required: ['query']
        }
      },

      // Create Lark document
      create_lark_document: {
        name: 'create_lark_document',
        description: 'Create a new document in Lark Docs',
        inputSchema: {
          type: 'object',
          properties: {
            title: { 
              type: 'string', 
              description: 'Document title' 
            },
            content: { 
              type: 'string', 
              description: 'Document content (markdown or rich text)' 
            },
            folderId: { 
              type: 'string', 
              description: 'Folder ID to create document in (optional)' 
            }
          },
          required: ['title', 'content']
        }
      },

      // Schedule calendar event
      schedule_lark_calendar_event: {
        name: 'schedule_lark_calendar_event',
        description: 'Create a calendar event in Lark Calendar',
        inputSchema: {
          type: 'object',
          properties: {
            title: { 
              type: 'string', 
              description: 'Event title' 
            },
            startTime: { 
              type: 'string', 
              format: 'date-time',
              description: 'Event start time (ISO format)' 
            },
            endTime: { 
              type: 'string', 
              format: 'date-time',
              description: 'Event end time (ISO format)' 
            },
            attendees: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'List of attendee emails' 
            },
            description: { 
              type: 'string', 
              description: 'Event description (optional)' 
            }
          },
          required: ['title', 'startTime', 'endTime']
        }
      }
    };
  }

  async handleMCPRequest(request) {
    const { method, params } = request;

    switch (method) {
      case 'tools/list':
        return {
          tools: Object.values(this.tools)
        };

      case 'tools/call': {
        const { name, arguments: args } = params;
        return await this.executeTools(name, args);
      }

      default:
        throw new Error(`Unknown MCP method: ${method}`);
    }
  }

  async executeTools(toolName, args) {
    try {
      switch (toolName) {
        case 'send_lark_message':
          return await this.sendLarkMessage(args);
        
        case 'create_lark_base_record':
          return await this.createLarkBaseRecord(args);
        
        case 'search_lark_messages':
          return await this.searchLarkMessages(args);
        
        case 'create_lark_document':
          return await this.createLarkDocument(args);
        
        case 'schedule_lark_calendar_event':
          return await this.scheduleCalendarEvent(args);
        
        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error);
      throw error;
    }
  }

  async sendLarkMessage(args) {
    const { chatId, message, messageType = 'text' } = args;
    
    let messageContent;
    switch (messageType) {
      case 'text':
        messageContent = { text: message };
        break;
      case 'post':
        messageContent = { post: { zh_cn: { content: message } } };
        break;
      case 'card':
        messageContent = { card: JSON.parse(message) };
        break;
      default:
        messageContent = { text: message };
    }

    const response = await this.larkClient.im.message.create({
      receive_id_type: chatId.includes('@') ? 'email' : 'chat_id',
      receive_id: chatId,
      msg_type: messageType,
      content: JSON.stringify(messageContent)
    });

    return {
      success: true,
      messageId: response.data.message_id,
      chatId
    };
  }

  async createLarkBaseRecord(args) {
    const { appToken, tableId, fields } = args;

    const response = await this.larkClient.bitable.appTableRecord.create({
      app_token: appToken,
      table_id: tableId,
      fields
    });

    return {
      success: true,
      recordId: response.data.record.record_id,
      fields: response.data.record.fields
    };
  }

  async searchLarkMessages(args) {
    const { query, chatId, timeRange = '7d' } = args;
    
    // Calculate time range
    const now = new Date();
    const timeRangeMap = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    };
    const daysAgo = timeRangeMap[timeRange];
    const startTime = Math.floor((now.getTime() - daysAgo * 24 * 60 * 60 * 1000) / 1000);

    const searchParams = {
      query,
      start_time: startTime.toString(),
      page_size: 20
    };

    if (chatId) {
      searchParams.chat_id = chatId;
    }

    const response = await this.larkClient.search.message.create(searchParams);

    return {
      success: true,
      messages: response.data.messages || [],
      total: response.data.total || 0
    };
  }

  async createLarkDocument(args) {
    const { title, content, folderId } = args;

    const createParams = {
      title,
      type: 'doc'
    };

    if (folderId) {
      createParams.folder_token = folderId;
    }

    // Create document
    const response = await this.larkClient.docx.document.create(createParams);
    const docToken = response.data.document.document_id;

    // Add content to document
    await this.larkClient.docx.document.rawContent.create({
      document_id: docToken,
      content
    });

    return {
      success: true,
      documentId: docToken,
      title,
      url: `https://docs.larksuite.com/docx/${docToken}`
    };
  }

  async scheduleCalendarEvent(args) {
    const { title, startTime, endTime, attendees = [], description } = args;

    const eventData = {
      summary: title,
      start_time: {
        timestamp: Math.floor(new Date(startTime).getTime() / 1000).toString()
      },
      end_time: {
        timestamp: Math.floor(new Date(endTime).getTime() / 1000).toString()
      },
      attendee_ability: 'can_see_others',
      free_busy_status: 'busy'
    };

    if (description) {
      eventData.description = description;
    }

    if (attendees.length > 0) {
      eventData.attendees = attendees.map(email => ({
        type: 'third_party',
        is_optional: false,
        third_party_email: email
      }));
    }

    const response = await this.larkClient.calendar.calendarEvent.create({
      calendar_id: 'primary',
      ...eventData
    });

    return {
      success: true,
      eventId: response.data.event.event_id,
      title,
      startTime,
      endTime
    };
  }

  async start() {
    const port = this.config.port || 3000;
    
    this.app.listen(port, () => {
      console.log(`🚀 Lark MCP Server running on port ${port}`);
      console.log(`📱 Lark App ID: ${this.config.larkAppId}`);
      console.log(`🔗 MCP Endpoint: http://localhost:${port}/mcp`);
      console.log(`❤️  Health Check: http://localhost:${port}/health`);
    });
  }
}

// Configuration
const config = {
  larkAppId: process.env.LARK_APP_ID || 'your_app_id',
  larkAppSecret: process.env.LARK_APP_SECRET || 'your_app_secret',
  port: process.env.PORT || 3000,
  domain: process.env.LARK_DOMAIN || 'https://open.larksuite.com'
};

// Start server
if (require.main === module) {
  const server = new LarkMCPServer(config);
  server.start().catch(error => {
    console.error('Failed to start server:', error);
    throw error;
  });
}

module.exports = LarkMCPServer; 