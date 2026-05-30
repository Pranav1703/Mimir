import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Header from "../components/Header";
import IngestionBar from "../components/IngestionBar";
import Sidebar from "../components/Sidebar";
import SessionList from "../components/SessionList";
import LoadingSpinner from "../components/LoadingSpinner";
import axios from "axios";
import { getSessions, getSessionMessages, deleteSession } from "../api/articles";
import type { Session } from "../api/articles";

interface Message {
  role: "user" | "bot";
  content: string;
  createdAt?: string;
}

function formatTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Home() {
  const [ingesting, setIngesting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [articlesKey, setArticlesKey] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const data = await getSessions();
      setSessions(data);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  async function handleLinkAdd(url: string) {
    if (!url.trim()) return;
    setIngesting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/ingest/link`, 
        { url }, 
        { withCredentials: true }
      );

      setActiveSessionId(null);
      setMessages([{ role: "bot", content: `Summarized <b>${url}</b>. Ask me anything about it!`, createdAt: new Date().toISOString() }]);
      setArticlesKey(k => k + 1);
    } catch (error) {
      console.error("Link ingestion failed:", error);
      setMessages([{ role: "bot", content: "Failed to ingest link. Please ensure your backend and Ollama are fully active.", createdAt: new Date().toISOString() }]);
    } finally {
      setIngesting(false);
    }
  }

  async function handleFilePick(fileObj: File) {
    if (!fileObj) return;
    setIngesting(true);

    const formData = new FormData();
    formData.append("file", fileObj);

    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/ingest/file`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      setActiveSessionId(null);
      setMessages([{ role: "bot", content: `Summarized file **${fileObj.name}**. Ask me anything about it!`, createdAt: new Date().toISOString() }]);
      setArticlesKey(k => k + 1);
    } catch (error) {
      console.error("File parsing ingestion processing failed:", error);
      setMessages([{ role: "bot", content: `Failed to vectorize file ${fileObj.name}.`, createdAt: new Date().toISOString() }]);
    } finally {
      setIngesting(false);
    }
  }

  async function handleChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput("");
    const now = new Date().toISOString();
    setMessages((prev) => [...prev, { role: "user", content: msg, createdAt: now }]);
    setChatLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/chat/talk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: msg,
          session_id: activeSessionId || undefined,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", content: data.response || data.message || "No response", createdAt: new Date().toISOString() }]);
      if (data.session_id) {
        setActiveSessionId(data.session_id);
      }
      fetchSessions();
    } catch {
      setMessages((prev) => [...prev, { role: "bot", content: "Failed to get response. Make sure backend is running.", createdAt: new Date().toISOString() }]);
    } finally {
      setChatLoading(false);
    }
  }

  async function handleSelectSession(sessionId: string) {
    setActiveSessionId(sessionId);
    try {
      const msgs = await getSessionMessages(sessionId);
      setMessages(msgs.map(m => ({
        role: m.role === "chatbot" ? "bot" : "user",
        content: m.content,
        createdAt: m.createdAt,
      })));
    } catch {
      setMessages([{ role: "bot", content: "Failed to load session messages." }]);
    }
  }

  async function handleDeleteSession(sessionId: string) {
    try {
      await deleteSession(sessionId);
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
      fetchSessions();
    } catch {
      // silently fail
    }
  }

  function handleNewChat() {
    setActiveSessionId(null);
    setMessages([]);
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="h-dvh flex flex-col bg-(--bg-primary) text-(--text-secondary) font-mono">
      <Header
        right={
          <div className="flex items-center gap-1">
            <motion.button
              onClick={() => setLeftOpen((p) => !p)}
              className="shrink-0 rounded-lg w-8 h-8 flex items-center justify-center transition-colors"
              style={{ color: leftOpen ? "var(--accent)" : "var(--text-dim)" }}
              whileHover={{ scale: 1.1, color: "var(--text-secondary)" }}
              whileTap={{ scale: 0.9 }}
              title="Session history"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </motion.button>
            <motion.button
              onClick={() => setRightOpen((p) => !p)}
              className="shrink-0 rounded-lg w-8 h-8 flex items-center justify-center transition-colors"
              style={{ color: rightOpen ? "var(--accent)" : "var(--text-dim)" }}
              whileHover={{ scale: 1.1, color: "var(--text-secondary)" }}
              whileTap={{ scale: 0.9 }}
              title="Saved articles"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </motion.button>
          </div>
        }
      />

      <div className="flex-1 flex overflow-hidden">
        <SessionList
          open={leftOpen}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelect={handleSelectSession}
          onDelete={handleDeleteSession}
          onNewChat={handleNewChat}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto">
            {!hasMessages && !ingesting && (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm tracking-widest uppercase select-none" style={{ color: "var(--text-dim)" }}>
                  Ask anything about your articles or documents
                </p>
              </div>
            )}

            {ingesting && !hasMessages && (
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <LoadingSpinner size={32} />
                <motion.p
                  className="text-sm tracking-widest uppercase"
                  style={{ color: "var(--text-dim)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  Processing article…
                </motion.p>
              </div>
            )}

            {hasMessages && (
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
                <AnimatePresence mode="popLayout">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <div className="max-w-[85%]">
                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                            msg.role === "user" ? "rounded-br-md" : "rounded-bl-md"
                          }`}
                          style={
                            msg.role === "user"
                              ? {
                                  backgroundColor: "color-mix(in srgb, var(--accent-light) 7%, transparent)",
                                  border: "1px solid color-mix(in srgb, var(--accent-light) 13%, transparent)",
                                  color: "var(--text-secondary)",
                                }
                              : {
                                  backgroundColor: "color-mix(in srgb, var(--accent-grey) 3%, transparent)",
                                  border: "1px solid color-mix(in srgb, var(--accent-grey) 8%, transparent)",
                                  color: "var(--text-muted)",
                                }
                          }
                        >
                          {msg.content}
                        </div>
                        {msg.createdAt && (
                          <p
                            className={`text-[10px] mt-1 ${msg.role === "user" ? "text-right" : "text-left"}`}
                            style={{ color: "var(--text-dim)" }}
                          >
                            {formatTime(msg.createdAt)}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {chatLoading && (
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div
                      className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--accent-grey) 3%, transparent)",
                        border: "1px solid color-mix(in srgb, var(--accent-grey) 8%, transparent)",
                      }}
                    >
                      <div className="flex gap-1">
                        <motion.span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: "var(--accent)" }}
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: "var(--accent)" }}
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                        />
                        <motion.span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: "var(--accent)" }}
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t px-4 py-4 pb-6 shrink-0" style={{ borderColor: "color-mix(in srgb, var(--accent) 13%, transparent)" }}>
            <div className="max-w-3xl mx-auto">
              <IngestionBar
                chatValue={chatInput}
                loading={ingesting || chatLoading}
                onChatChange={setChatInput}
                onChatSubmit={handleChat}
                onLinkAdd={handleLinkAdd}
                onFilePick={handleFilePick}
              />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {rightOpen && (
            <Sidebar key={articlesKey} open={rightOpen} onClose={() => setRightOpen(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Home;
