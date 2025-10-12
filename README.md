# Chat Widget Backend Server

This is a simple Express.js backend that proxies requests to OpenAI's API.

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create `.env` file:**

   ```bash
   copy ..\.env.template .env
   ```

   Then edit `.env` and add your OpenAI API key.

3. **Run the server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### `GET /health`

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "message": "Chat API is running"
}
```

### `POST /api/chat`

Send a message and get a complete response.

**Request Body:**

```json
{
  "message": "Hello!",
  "conversationHistory": [
    { "sender": "user", "content": "Previous message" },
    { "sender": "bot", "content": "Previous response" }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "response": "Hello! How can I help you today?",
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 8,
    "total_tokens": 18
  }
}
```

### `POST /api/chat/stream`

Stream a response in real-time (Server-Sent Events).

**Request Body:** Same as `/api/chat`

**Response:** SSE stream with JSON chunks

```
data: {"content":"Hello"}
data: {"content":"!"}
data: [DONE]
```

## Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key (required)
- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)

## Security Notes

- Never commit your `.env` file
- In production, implement rate limiting
- Add authentication to protect endpoints
- Monitor API usage and costs
