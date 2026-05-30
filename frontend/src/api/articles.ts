import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL ?? "http://127.0.0.1:3002",
  withCredentials: true,
});

export async function getTitles(): Promise<string[]> {
  const { data } = await api.get("/chat/articleTitles");
  return data;
}

export interface Session {
  id: string;
  title: string;
}

export interface ChatMessage {
  role: string;
  content: string;
  createdAt: string;
}

export interface SessionsResponse {
  sessions: Session[];
}

export async function getSessions(): Promise<Session[]> {
  const { data } = await api.get<SessionsResponse>("/chat/sessions");
  return data.sessions ?? [];
}

export async function getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  const { data } = await api.get<{ messages: ChatMessage[] }>(`/chat/session/${sessionId}/messages`);
  return data.messages ?? [];
}

export async function deleteSession(sessionId: string): Promise<void> {
  await api.delete(`/chat/session/${sessionId}`);
}
