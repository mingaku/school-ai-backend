# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the School AI Backend - a Node.js REST API server that acts as a unified proxy layer for multiple AI services (OpenAI, Anthropic Claude, Amazon Bedrock, Azure AI, Google Vertex AI). The backend provides streaming support and handles file/image processing for AI interactions.

## Essential Commands

### Development
```bash
# Install dependencies
npm install

# Start the development server (runs on port 8080 by default)
npm start
# or
node index.js

# Run with custom port
PORT=3000 node index.js
```

### Deployment to Google Cloud Run
```bash
# Build and deploy in one command
gcloud builds submit --project chatgpt-teacher --tag gcr.io/chatgpt-teacher/gpt && gcloud beta run deploy school-ai --image gcr.io/chatgpt-teacher/gpt --platform managed

# Just build the container
gcloud builds submit --project chatgpt-teacher --tag gcr.io/chatgpt-teacher/gpt

# Just deploy (after building)
gcloud beta run deploy school-ai --image gcr.io/chatgpt-teacher/gpt --platform managed
```

## Architecture & Code Structure

### Controller-Route Pattern
Each AI service integration follows a consistent pattern:
- **Route files** (`routes/*.js`): Define Express endpoints, handle request/response
- **Controller files** (`controllers/*.js`): Contain business logic and AI service client initialization

When adding a new AI service:
1. Create a controller in `controllers/` with the service logic
2. Create a route in `routes/` that uses the controller
3. Register the route in `index.js`

### Key Service Implementations

**OpenAI Integration** (`controllers/openaiController.js`):
- Streaming chat completions with event-stream format
- Assistant API with file handling
- TTS functionality
- Pattern: Uses `openai.beta.chat.completions.stream()` for streaming

**Claude Integration** (`controllers/claudeController.js`):
- Direct Anthropic SDK integration
- Automatic image URL to base64 conversion
- Streaming responses using `anthropic.messages.stream()`

**Bedrock Integration** (`controllers/bedrockController.js`):
- Multi-region support (automatically selects based on model)
- Uses AWS SDK's `InvokeModelWithResponseStreamCommand`
- Handles both Claude 3 and 3.5 models

**Azure AI Integration** (multiple controllers):
- `azureController.js`: Azure AI Agents
- `azureAssistantController.js`: Azure Assistant API
- `azureOpenAIController.js`: Azure OpenAI service
- Each uses specific Azure SDK packages

**Vertex AI Integration** (`controllers/vertexAIController.js`):
- Gemini model support
- Google Search Retrieval tool integration
- Streaming using `generateContentStream()`

### Streaming Response Pattern
Most endpoints support streaming. The standard pattern:
```javascript
res.writeHead(200, {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive'
});

// Stream chunks
for await (const chunk of stream) {
  res.write(`data: ${JSON.stringify(chunk)}\n\n`);
}

res.write('data: [DONE]\n\n');
res.end();
```

### Image Processing Pattern
When handling images in requests:
1. Check if image URLs are provided
2. Fetch and convert to base64 if needed
3. Format according to service requirements (e.g., Claude expects specific image format)

### Environment Variables
Required in `.env`:
- `OPENAI_API_KEY`: OpenAI API key
- `ANTHROPIC_API_KEY`: Anthropic Claude API key
- AWS credentials for Bedrock
- Azure service credentials
- Google Cloud credentials for Vertex AI
- `PORT`: Server port (optional, defaults to 8080)

## Important Deployment Notes

1. **Shared Environment**: All environments (Local, Staging, Production) currently use the same Cloud Run backend for cost optimization
2. **File Storage**: Uses `/tmp` directory for temporary file storage - files should be cleaned up after processing
3. **Request Limits**: 50MB payload limit configured for large file/image uploads
4. **CORS**: Enabled for all origins - adjust in production as needed
5. **Region Selection**: Backend automatically selects AWS region based on model name (us-east-2 for newer models, ap-northeast-1 for others)

## Common Development Tasks

### Adding a New Endpoint
1. Create controller method in appropriate controller file
2. Add route in corresponding route file
3. Test with streaming and non-streaming responses

### Debugging Streaming Issues
- Check response headers are set correctly before streaming
- Ensure `res.write()` includes proper event-stream format
- Verify `[DONE]` signal is sent at stream end

### Handling Service Errors
- Each controller should handle service-specific errors
- Return appropriate HTTP status codes
- Log errors for debugging but don't expose sensitive details to clients

## Testing Approach

Currently no automated tests. When testing manually:
```bash
# Test local server
curl http://localhost:8080/health

# Test streaming endpoint
curl -N -X POST http://localhost:8080/streaming-response \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

## Project Constraints

- No linting or formatting tools configured - follow existing code style
- No test suite - changes require manual testing
- Docker deployment only - no direct Node.js deployment support
- All AI service credentials must be configured for full functionality