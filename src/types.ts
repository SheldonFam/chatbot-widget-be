// ============================================
// Message Types
// ============================================

export type MessageRole = "user" | "assistant";

export interface Message {
  role: MessageRole;
  content: string;
}

// Legacy frontend message format (for backwards compatibility)
export type MessageSender = "user" | "bot";

export interface LegacyMessage {
  id: string;
  content: string;
  sender: MessageSender;
  timestamp: number;
  feedback?: "positive" | "negative" | null;
  isStreaming?: boolean;
}

// ============================================
// API Request/Response Types
// ============================================

export interface ChatRequest {
  message: string;
  history?: Message[];
  // Legacy support
  conversationHistory?: LegacyMessage[];
}

export interface ChatResponse {
  success: boolean;
  response: string;
  error?: string;
  details?: string;
}

export interface StreamChunk {
  content?: string;
  error?: string;
}

// ============================================
// Health Check
// ============================================

export interface HealthResponse {
  status: "ok" | "error";
  message: string;
  timestamp?: number;
}
