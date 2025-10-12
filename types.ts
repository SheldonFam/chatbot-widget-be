// ============================================
// Message Types
// ============================================

export type MessageSender = "user" | "bot";

export interface Message {
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
  conversationHistory?: Message[];
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
