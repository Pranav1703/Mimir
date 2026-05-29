import { useState, useEffect, useRef, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import Header from "../components/Header";

function classNames(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

interface Message {
  role: "user" | "bot";
  content: string;
}

function Chat() {
  const location = useLocation();
  const navigate = useNavigate();
  const articleUrl = (location.state as { articleUrl?: string })?.articleUrl || "";

  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Article saved and summarized. Ask me anything about it!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!articleUrl) {
      navigate("/");
    }
  }, [articleUrl, navigate]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [messages]);

  async function handleChat(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", content: data.response || data.message || "No response" }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "bot", content: "Failed to get response. Make sure backend is running." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-(--bg-primary) text-(--text-secondary) font-mono flex flex-col">
      <Header
        right={
          <>
            <span className="text-xs text-(--text-dim) truncate max-w-48" title={articleUrl}>
              {articleUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            </span>
            <motion.button
              onClick={() => navigate("/")}
              className="text-xs uppercase tracking-widest transition-colors"
              style={{ color: "var(--text-dim)" }}
              whileHover={{ scale: 1.05 }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-dim)"}
            >
              New
            </motion.button>
          </>
        }
      />

      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={classNames(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div
                    className={classNames(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                      msg.role === "user"
                        ? "rounded-br-md"
                        : "rounded-bl-md"
                    )}
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
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div
                    className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--accent-grey) 3%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--accent-grey) 8%, transparent)",
                    }}
                  >
                    <motion.div
                      className="flex gap-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
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
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-10 w-full">
          <motion.form
            onSubmit={handleChat}
            className="flex gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about the article…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-(--bg-surface) border rounded-full px-5 py-3 text-sm outline-none transition-colors placeholder:text-(--text-dim) disabled:opacity-30 text-(--text-primary)"
              style={{
                borderColor: "var(--accent-light)",
                boxShadow: "0 0 8px color-mix(in srgb, var(--accent-light) 20%, transparent)",
              }}
            />
            <motion.button
              type="submit"
              disabled={!input.trim() || loading}
              className="rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all disabled:opacity-30"
              style={{
                backgroundColor: "color-mix(in srgb, var(--accent-light) 13%, transparent)",
                color: "var(--accent-light)",
                border: "1px solid color-mix(in srgb, var(--accent-light) 27%, transparent)",
                boxShadow: "0 0 12px color-mix(in srgb, var(--accent-light) 13%, transparent)",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Send
            </motion.button>
          </motion.form>
        </div>
      </main>
    </div>
  );
}

export default Chat;
