import { useState, useEffect, useRef, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

const NEON_CYAN = "#00f0ff";
const NEON_LIGHT_BLUE = "#66d9ff";
const NEON_GREY = "#888899";

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
  const repoUrl = (location.state as { repoUrl?: string })?.repoUrl || "";

  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Repository analyzed successfully. Ask me anything about the code!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!repoUrl) {
      navigate("/");
    }
  }, [repoUrl, navigate]);

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
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200 font-mono flex flex-col">
      {/* HEADER */}
      <motion.header
        className="border-b"
        style={{ borderColor: `${NEON_CYAN}22` }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.h1
            className="text-2xl font-bold tracking-widest uppercase"
            style={{
              textShadow: `0 0 20px ${NEON_CYAN}, 0 0 40px ${NEON_CYAN}66`,
              color: NEON_CYAN,
            }}
          >
            Mimir
          </motion.h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 truncate max-w-48" title={repoUrl}>
              {repoUrl.replace("https://github.com/", "")}
            </span>
            <motion.button
              onClick={() => navigate("/")}
              className="text-xs uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              New
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* CHAT AREA */}
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
                            backgroundColor: `${NEON_LIGHT_BLUE}12`,
                            border: `1px solid ${NEON_LIGHT_BLUE}22`,
                            color: "#cce8f8",
                          }
                        : {
                            backgroundColor: `${NEON_GREY}08`,
                            border: `1px solid ${NEON_GREY}15`,
                            color: "#c8c8d8",
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
                      backgroundColor: `${NEON_GREY}08`,
                      border: `1px solid ${NEON_GREY}15`,
                    }}
                  >
                    <motion.div
                      className="flex gap-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: NEON_CYAN }}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: NEON_CYAN }}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                      />
                      <motion.span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: NEON_CYAN }}
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

        {/* CHAT INPUT */}
        <div className="max-w-3xl mx-auto px-4 pb-6 w-full">
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
              placeholder="Ask about the codebase…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-[#12121a] border rounded-full px-5 py-3 text-sm outline-none transition-colors placeholder:text-gray-600 disabled:opacity-30 text-white"
              style={{
                borderColor: NEON_LIGHT_BLUE,
                boxShadow: `0 0 8px ${NEON_LIGHT_BLUE}33`,
              }}
            />
            <motion.button
              type="submit"
              disabled={!input.trim() || loading}
              className="rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all disabled:opacity-30"
              style={{
                backgroundColor: `${NEON_LIGHT_BLUE}20`,
                color: NEON_LIGHT_BLUE,
                border: `1px solid ${NEON_LIGHT_BLUE}44`,
                boxShadow: `0 0 12px ${NEON_LIGHT_BLUE}22`,
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