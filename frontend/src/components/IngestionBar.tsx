import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import LoadingSpinner from "./LoadingSpinner";

export default function IngestionBar({
  chatValue,
  loading,
  onChatChange,
  onChatSubmit,
  onLinkAdd,
  onFilePick,
}: {
  chatValue: string;
  loading: boolean;
  onChatChange: (v: string) => void;
  onChatSubmit: (e: React.FormEvent) => void;
  onLinkAdd: (url: string) => void;
  onFilePick: (file: File) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      onFilePick(f);
      setMenuOpen(false);
    }
  }

  function handleLinkAdd() {
    const url = linkValue.trim();
    if (!url) return;
    
    onLinkAdd(url);
    setLinkValue("");
    setMenuOpen(false);
  }

  return (
    <div className="relative">
      <form
        onSubmit={onChatSubmit}
        className="flex items-center gap-2 w-full bg-(--bg-surface) border rounded-full px-2 py-2 text-sm transition-all"
        style={{
          borderColor: "var(--border-default)",
        }}
      >
        <div className="relative">
          <motion.button
            type="button"
            onClick={() => setMenuOpen((p) => !p)}
            className="shrink-0 rounded-full w-9 h-9 flex items-center justify-center transition-colors"
            style={{
              backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)",
              color: "var(--accent)",
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                className="absolute left-0 bottom-full mb-2 w-72 rounded-xl overflow-hidden z-20"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                }}
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <div className="p-3 space-y-3">
                  <div>
                    <p className="text-xs font-medium mb-1.5 px-1" style={{ color: "var(--text-dim)" }}>
                      Add a link
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://"
                        value={linkValue}
                        onChange={(e) => setLinkValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleLinkAdd();
                          }
                        }}
                        className="flex-1 bg-(--bg-primary) border rounded-lg px-3 py-2 text-sm outline-none text-(--text-primary) placeholder:text-(--text-dim)"
                        style={{ borderColor: "var(--border-default)" }}
                      />
                      <motion.button
                        type="button"
                        onClick={handleLinkAdd}
                        disabled={!linkValue.trim()}
                        className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-all disabled:opacity-40"
                        style={{
                          backgroundColor: "var(--accent)",
                          color: "var(--bg-primary)",
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Add
                      </motion.button>
                    </div>
                  </div>

                  <div className="border-t" style={{ borderColor: "var(--border-default)" }} />
                  <div className="pt-1">
                    <motion.button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors"
                      style={{ color: "var(--text-secondary)" }}
                      whileHover={{ backgroundColor: "color-mix(in srgb, var(--accent) 8%, transparent)" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent)" }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      Upload file
                      <span className="ml-auto text-xs" style={{ color: "var(--text-dim)" }}>.pdf, .txt, .md, .docx</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md,.docx"
          className="hidden"
          onChange={handleFilePick}
        />

        <input
          type="text"
          placeholder="Ask about your knowledge base…"
          value={chatValue}
          onChange={(e) => onChatChange(e.target.value)}
          disabled={loading}
          className="flex-1 bg-transparent px-2 py-1 text-sm outline-none text-(--text-primary) placeholder:text-(--text-dim) disabled:opacity-50"
        />

        <motion.button
          type="submit"
          disabled={(!chatValue.trim() && !loading) || loading}
          className="shrink-0 rounded-full w-9 h-9 flex items-center justify-center transition-all disabled:opacity-40"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--bg-primary)",
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {loading ? (
            <LoadingSpinner size={16} />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </motion.button>
      </form>

      {menuOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
      )}
    </div>
  );
}
