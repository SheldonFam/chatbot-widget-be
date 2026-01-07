# Chatbot Widget Backend API

A production-ready Express.js backend API that provides chat functionality using Google's Gemini AI. Built with TypeScript, following Express.js best practices with proper separation of concerns, authentication, rate limiting, and comprehensive error handling.

## Features

- ✅ **Clean Architecture**: Controllers, Services, Routes separation
- ✅ **API Versioning**: `/api/v1` prefix for future compatibility
- ✅ **Authentication**: API key-based authentication
- ✅ **Rate Limiting**: Protection against abuse
- ✅ **Error Handling**: Centralized error handling with custom error types
- ✅ **TypeScript**: Full type safety
- ✅ **Streaming Support**: Server-Sent Events for real-time responses
- ✅ **CORS Configuration**: Configurable origin restrictions
- ✅ **Request Logging**: Built-in request/response logging
- ✅ **Configuration Management**: Centralized config with validation

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and set required variables:

```env
# Required
GOOGLE_API_KEY=your_google_api_key_here
API_KEY=your_secure_api_key_here

# Optional
PORT=3001
FRONTEND_URL=http://localhost:5173
```

**Get your Google API key:** https://aistudio.google.com/app/apikey

### 3. Run the Server

**Development:**

```bash
npm run dev
```

**Production:**

```bash
npm run build
npm start
```

The server will start on `http://localhost:3001` (or your configured PORT).

## API Documentation

### Base URL

```
http://localhost:3001/api/v1
```

### Authentication

All endpoints except `/health` require authentication. Include your API key in the request header:

**Option 1: Bearer Token**

```
Authorization: Bearer your_api_key_here
```

**Option 2: Custom Header**

```
x-api-key: your_api_key_here
```

---

### Endpoints

#### `GET /api/v1/health`

Health check endpoint (no authentication required).

**Response:**

```json
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

#### `POST /api/v1/chat`

Send a message and receive a complete AI response.

**Headers:**

```
Authorization: Bearer your_api_key_here
Content-Type: application/json
```

**Request Body:**

```json
{
  "message": "What is TypeScript?",
  "history": [
    {
      "role": "user",
      "content": "Hello!"
    },
    {
      "role": "assistant",
      "content": "Hi! How can I help you today?"
    }
  ]
}
```

**Response (Success):**

```json
{
  "success": true,
  "response": "TypeScript is a strongly typed programming language that builds on JavaScript..."
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Message is required",
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/chat"
}
```

---

#### `POST /api/v1/chat/stream`

Stream AI responses in real-time using Server-Sent Events.

**Headers:**

```
Authorization: Bearer your_api_key_here
Content-Type: application/json
```

**Request Body:** Same as `/api/v1/chat`

**Response (SSE Stream):**

```
data: {"success":true,"response":"Type","done":false}

data: {"success":true,"response":"Script","done":false}

data: {"success":true,"response":" is","done":false}

data: {"success":true,"response":"","done":true}
```

---

## Environment Variables

### Required

| Variable         | Description                         | Example             |
| ---------------- | ----------------------------------- | ------------------- |
| `GOOGLE_API_KEY` | Google Gemini API key               | `AIza...`           |
| `API_KEY`        | API key for endpoint authentication | `my-secure-key-123` |

### Optional

| Variable                  | Description                            | Default                          |
| ------------------------- | -------------------------------------- | -------------------------------- |
| `PORT`                    | Server port                            | `3001`                           |
| `NODE_ENV`                | Environment mode                       | `development`                    |
| `FRONTEND_URL`            | Allowed CORS origins (comma-separated) | `http://localhost:5173`          |
| `AI_MODEL`                | Gemini model to use                    | `gemini-2.0-flash-exp`           |
| `SYSTEM_INSTRUCTION`      | AI system prompt                       | `You are a helpful assistant...` |
| `MAX_OUTPUT_TOKENS`       | Maximum AI response length             | `500`                            |
| `TEMPERATURE`             | AI creativity (0.0-1.0)                | `0.7`                            |
| `RATE_LIMIT_WINDOW_MS`    | Rate limit window in milliseconds      | `60000` (1 min)                  |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window                | `100`                            |

## Project Structure

```
chatbot-widget-be/
├── index.ts                          # Main Express app
├── src/
│   ├── config/
│   │   └── index.ts                  # Centralized configuration
│   ├── controllers/
│   │   ├── chatController.ts         # Chat request handlers
│   │   └── healthController.ts       # Health check handler
│   ├── services/
│   │   └── aiService.ts              # AI service layer
│   ├── middleware/
│   │   ├── auth.ts                   # API key authentication
│   │   ├── errorHandler.ts           # Global error handler
│   │   ├── rateLimiter.ts            # Rate limiting
│   │   └── requestLogger.ts          # Request logging
│   ├── routes/
│   │   └── v1/
│   │       ├── index.ts              # v1 route aggregator
│   │       ├── chat.routes.ts        # Chat routes
│   │       └── health.routes.ts      # Health routes
│   ├── errors/
│   │   └── index.ts                  # Custom error classes
│   └── types.ts                      # TypeScript type definitions
├── utils/
│   └── validation.ts                 # Request validation
├── .env.example                      # Environment template
├── package.json
└── tsconfig.json
```

## Architecture Highlights

### Separation of Concerns

- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic and external API calls
- **Routes**: Route definitions and middleware binding
- **Middleware**: Cross-cutting concerns (auth, logging, errors)
- **Config**: Centralized configuration management

### Error Handling

Custom error classes for better error categorization:

- `ValidationError` (400): Invalid request data
- `AuthenticationError` (401): Invalid/missing API key
- `NotFoundError` (404): Resource not found
- `RateLimitError` (429): Rate limit exceeded
- `AIServiceError` (503): AI service failure

### Rate Limiting

- **General API**: 100 requests/minute per IP
- **Chat endpoints**: 20 requests/minute per IP (stricter)

### Security Features

- API key authentication on chat endpoints
- CORS with configurable origins
- Rate limiting to prevent abuse
- Request validation
- Error messages don't leak sensitive info

## Development

### Run Tests

```bash
npm test
```

### Build TypeScript

```bash
npm run build
```

### Lint Code

```bash
npm run lint
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `API_KEY`
3. Configure `FRONTEND_URL` to your production domain
4. Consider using a process manager (PM2, systemd)
5. Set up monitoring and logging
6. Use HTTPS in production

### Example PM2 Setup

```bash
npm install -g pm2
npm run build
pm2 start dist/index.js --name chatbot-api
pm2 save
pm2 startup
```

## API Client Examples

### JavaScript/TypeScript

```typescript
const response = await fetch("http://localhost:3001/api/v1/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer your_api_key_here",
  },
  body: JSON.stringify({
    message: "Hello!",
    history: [],
  }),
});

const data = await response.json();
console.log(data.response);
```

### Streaming Example

```typescript
const eventSource = new EventSource(
  "http://localhost:3001/api/v1/chat/stream",
  {
    headers: {
      Authorization: "Bearer your_api_key_here",
    },
  }
);

eventSource.onmessage = (event) => {
  const chunk = JSON.parse(event.data);
  if (chunk.done) {
    eventSource.close();
  } else {
    console.log(chunk.response);
  }
};
```

## Troubleshooting

### "Missing required environment variables"

- Ensure `.env` file exists with `GOOGLE_API_KEY` and `API_KEY`

### "Invalid API key" (401)

- Check that you're sending the correct API key in headers
- Verify header format: `Authorization: Bearer <key>` or `x-api-key: <key>`

### "Too many requests" (429)

- You've hit the rate limit
- Wait a minute or adjust `RATE_LIMIT_MAX_REQUESTS` in `.env`

### CORS errors

- Add your frontend URL to `FRONTEND_URL` in `.env`
- Multiple origins: `FRONTEND_URL=http://localhost:3000,http://localhost:5173`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
