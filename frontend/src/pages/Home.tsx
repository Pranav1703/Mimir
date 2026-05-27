import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Header from "../components/Header";
import IngestionBar from "../components/IngestionBar";

interface Message {
  role: "user" | "bot";
  content: string;
}

function Home() {
  const [ingesting, setIngesting] = useState(false);
  const [mode, setMode] = useState<"start" | "chat">("start");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  function handleLinkAdd(url: string) {
    setIngesting(true);
    setTimeout(() => {
      setIngesting(false);
      setMode("chat");
      setMessages([{ role: "bot", content: `Summarized **${url}**. Ask me anything about it!` }]);
    }, 1500);
  }

  function handleFilePick(name: string) {
    setIngesting(true);
    setTimeout(() => {
      setIngesting(false);
      setMode("chat");
      setMessages([{ role: "bot", content: `Summarized **${name}**. Ask me anything about it!` }]);
    }, 1500);
  }

  async function handleChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setChatLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", content: data.response || data.message || "No response" }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", content: "Failed to get response. Make sure backend is running." }]);
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-(--bg-primary) text-(--text-secondary) font-mono flex flex-col">
      <Header />

      {mode === "start" ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center w-full max-w-lg"
          >
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-widest uppercase mb-6"
              style={{
                textShadow: "0 0 30px var(--accent), 0 0 60px color-mix(in srgb, var(--accent) 40%, transparent), 0 0 90px color-mix(in srgb, var(--accent) 20%, transparent)",
                color: "var(--accent)",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Briefly
            </motion.h1>

            <motion.p
              className="text-(--text-muted) mb-10 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Your unified knowledge base. Save links, docs, and notes to chat with your second brain.
            </motion.p>

            <IngestionBar
              chatValue={chatInput}
              loading={ingesting}
              onChatChange={setChatInput}
              onChatSubmit={handleChat}
              onLinkAdd={handleLinkAdd}
              onFilePick={handleFilePick}
            />
          </motion.div>
        </div>
      ) : (
        <main className="flex-1 flex flex-col">
          <div className="border-b px-4 py-3" style={{ borderColor: "color-mix(in srgb, var(--accent) 13%, transparent)" }}>
            <div className="max-w-3xl mx-auto">
              <IngestionBar
                chatValue={chatInput}
                loading={ingesting}
                onChatChange={setChatInput}
                onChatSubmit={handleChat}
                onLinkAdd={handleLinkAdd}
                onFilePick={handleFilePick}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
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
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
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
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default Home;
