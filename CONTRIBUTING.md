# 🤝 Contributing to Lark MCP n8n Automation

Thank you for your interest in contributing to the Lark MCP n8n Automation project! This guide will help you get started with contributing to this open-source project.

## 🎯 Ways to Contribute

### 🐛 Bug Reports
- Search existing issues before creating new ones
- Use the bug report template
- Include system information, error logs, and reproduction steps
- Provide minimal reproducible examples when possible

### ✨ Feature Requests
- Check if the feature has already been requested
- Use the feature request template
- Clearly describe the use case and benefits
- Consider implementation complexity and maintenance burden

### 🔧 Code Contributions
- Bug fixes
- New Lark API integrations
- Performance improvements
- Documentation updates
- Test coverage improvements

### 📚 Documentation
- API documentation improvements
- Tutorial and guide creation
- Code examples and use cases
- Translation support

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v16.0.0 or higher
- **npm**: v8.0.0 or higher
- **Git**: Latest version
- **Lark App**: Access to Lark Open Platform for testing

### Development Setup

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/lark-mcp-n8n-automation.git
   cd lark-mcp-n8n-automation
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Run interactive setup
   npm run setup
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Run Tests**
   ```bash
   # Unit tests
   npm test
   
   # Integration tests
   npm run test:integration
   
   # Coverage report
   npm run test:coverage
   ```

## 📝 Development Guidelines

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check code style
npm run lint

# Auto-fix style issues
npm run lint:fix

# Format code
npm run format
```

#### TypeScript Guidelines
- Use TypeScript for all new code
- Define proper interfaces for all API interactions
- Use strict type checking
- Document complex types with JSDoc comments

#### Example Code Style
```typescript
/**
 * Sends a message to a Lark chat or user
 * @param params - Message parameters
 * @returns Promise resolving to message response
 */
async function sendLarkMessage(params: SendMessageParams): Promise<SendMessageResponse> {
  const { chatId, message, messageType = 'text' } = params;
  
  // Validate input
  if (!chatId || !message) {
    throw new Error('chatId and message are required');
  }
  
  // Implementation...
  return response;
}
```

### Git Workflow

We follow the **GitHub Flow** with semantic commits:

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/add-lark-calendar-integration
   ```

2. **Make Commits**
   ```bash
   # Use conventional commit messages
   git commit -m "feat: add calendar event creation tool"
   git commit -m "docs: update API documentation for calendar"
   git commit -m "test: add calendar integration tests"
   ```

3. **Push and Create PR**
   ```bash
   git push origin feature/add-lark-calendar-integration
   # Create PR on GitHub
   ```

#### Commit Message Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(lark): add document creation tool
fix(auth): handle token refresh edge case
docs(readme): update installation instructions
test(mcp): add integration tests for tool execution
```

### Testing Requirements

#### Unit Tests
- All new functions must have unit tests
- Aim for 80%+ code coverage
- Use Jest for testing framework
- Mock external dependencies

```typescript
// Example test
describe('sendLarkMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send text message successfully', async () => {
    // Arrange
    const mockLarkClient = {
      im: {
        message: {
          create: jest.fn().mockResolvedValue({
            data: { message_id: 'msg_123' }
          })
        }
      }
    };
    
    // Act
    const result = await sendLarkMessage({
      chatId: 'test@example.com',
      message: 'Hello, World!'
    });
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.messageId).toBe('msg_123');
  });
});
```

#### Integration Tests
- Test full API workflows
- Use real Lark API in test environment
- Include error handling scenarios
- Test MCP protocol compliance

### Documentation Standards

#### Code Documentation
- Use JSDoc for all public functions
- Include parameter types and descriptions
- Provide usage examples
- Document error conditions

```typescript
/**
 * Creates a new record in Lark Base
 * 
 * @param params - Record creation parameters
 * @param params.appToken - Lark Base application token
 * @param params.tableId - Target table identifier
 * @param params.fields - Record field values
 * @returns Promise resolving to creation result
 * 
 * @throws {LarkAPIError} When API request fails
 * @throws {ValidationError} When required fields are missing
 * 
 * @example
 * ```typescript
 * const result = await createLarkBaseRecord({
 *   appToken: 'bascnC0k12345',
 *   tableId: 'tblabcd1234',
 *   fields: {
 *     'Name': 'John Doe',
 *     'Email': 'john@example.com'
 *   }
 * });
 * ```
 */
```

#### API Documentation
- Keep TECHNICAL_SPEC.md updated
- Document all tool parameters and responses
- Include error codes and handling
- Provide integration examples

## 🧪 Testing Strategy

### Local Testing

1. **Unit Tests**
   ```bash
   npm test
   ```

2. **Integration Tests**
   ```bash
   # Requires Lark API credentials
   npm run test:integration
   ```

3. **End-to-End Tests**
   ```bash
   # Tests full MCP workflow
   npm run test:e2e
   ```

### Test Environment Setup

Create a test Lark app for development:

1. Go to [Lark Open Platform](https://open.larksuite.com/)
2. Create a test application
3. Configure minimal permissions
4. Use test credentials in `.env.test`

```bash
# Test environment variables
LARK_APP_ID=cli_test123
LARK_APP_SECRET=test_secret
TEST_CHAT_ID=test_chat_123
TEST_USER_EMAIL=test@example.com
```

## 🔍 Code Review Process

### Pull Request Guidelines

1. **PR Description**
   - Clear title describing the change
   - Detailed description of what was changed and why
   - Link to related issues
   - Include screenshots for UI changes

2. **Checklist**
   - [ ] Tests pass locally
   - [ ] Code follows style guidelines
   - [ ] Documentation updated
   - [ ] Breaking changes documented
   - [ ] Security considerations addressed

3. **Review Process**
   - All PRs require at least one review
   - Core maintainers will review within 48 hours
   - Address feedback promptly
   - Ensure CI passes before merge

### Review Criteria

**Code Quality**
- Follows established patterns
- Proper error handling
- Performance considerations
- Security best practices

**Testing**
- Adequate test coverage
- Tests are meaningful
- Edge cases covered
- Integration tests included

**Documentation**
- Code is self-documenting
- Complex logic explained
- API changes documented
- Examples provided

## 🔒 Security Guidelines

### Reporting Security Issues

**Do NOT create public issues for security vulnerabilities.**

Instead:
1. Email security@your-domain.com
2. Include detailed description
3. Provide reproduction steps
4. Allow 90 days for fix before disclosure

### Security Best Practices

1. **API Keys and Secrets**
   - Never commit credentials
   - Use environment variables
   - Rotate keys regularly
   - Use minimal permissions

2. **Input Validation**
   - Validate all user inputs
   - Sanitize data before processing
   - Use parameterized queries
   - Implement rate limiting

3. **Error Handling**
   - Don't expose internal details
   - Log security events
   - Fail securely
   - Use proper HTTP status codes

## 🏷️ Release Process

### Version Numbering
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps
1. Update CHANGELOG.md
2. Update version in package.json
3. Create release PR
4. Tag release after merge
5. Publish to npm (if applicable)
6. Update documentation

## 🎨 Issue Templates

### Bug Report Template
```markdown
**Bug Description**
A clear description of the bug.

**Steps to Reproduce**
1. Step one
2. Step two
3. See error

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happens.

**Environment**
- OS: [e.g., macOS 12.0]
- Node.js: [e.g., 16.14.0]
- Package version: [e.g., 1.0.0]

**Additional Context**
Logs, screenshots, etc.
```

### Feature Request Template
```markdown
**Feature Description**
Clear description of the proposed feature.

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should this be implemented?

**Alternatives Considered**
Other approaches you've considered.

**Additional Context**
Mockups, examples, etc.
```

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Maintain professional communication

### Getting Help
- Check documentation first
- Search existing issues
- Ask questions in discussions
- Join our Discord community

### Recognition
Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Given appropriate GitHub badges
- Invited to maintainer discussions

## 📞 Contact

- **Project Maintainers**: [@username1](https://github.com/username1), [@username2](https://github.com/username2)
- **Discord**: [Join our server](https://discord.gg/your-server)
- **Email**: contribute@your-domain.com

---

Thank you for contributing to Lark MCP n8n Automation! 🚀 