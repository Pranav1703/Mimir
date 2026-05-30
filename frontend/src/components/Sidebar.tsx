import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getTitles } from "../api/articles";

export default function Sidebar({ open, onClose }: { open: boolean; onClose?: () => void }) {
  const [titles, setTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  async function copyTitle(title: string, index: number) {
    try {
      await navigator.clipboard.writeText(title);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      // clipboard not available
    }
  }

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getTitles()
      .then(setTitles)
      .catch(() => setTitles([]))
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          className="w-64 shrink-0 border-l overflow-hidden flex flex-col bg-(--bg-primary)"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 13%, transparent)" }}
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 256 }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="px-4 py-4 border-b flex items-center justify-between" style={{ borderColor: "color-mix(in srgb, var(--accent) 13%, transparent)" }}>
            <h2 className="text-xs uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>
              Saved Documents &amp; Articles
            </h2>
            {onClose && (
              <motion.button
                onClick={onClose}
                className="shrink-0 rounded-lg w-6 h-6 flex items-center justify-center transition-colors"
                style={{ color: "var(--text-dim)" }}
                whileHover={{ scale: 1.15, color: "var(--text-secondary)" }}
                whileTap={{ scale: 0.9 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </motion.button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {loading ? (
              <div className="flex justify-center py-8">
                <motion.div
                  className="w-5 h-5 border-2 rounded-full"
                  style={{
                    borderColor: "color-mix(in srgb, var(--accent) 20%, transparent)",
                    borderTopColor: "var(--accent)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              </div>
            ) : titles.length === 0 ? (
              <p className="px-4 py-6 text-xs text-center" style={{ color: "var(--text-dim)" }}>
                No articles yet
              </p>
            ) : (
              <ul className="space-y-0.5 px-2">
                {titles.map((title, i) => (
                  <motion.li
                    key={i}
                    className="px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors break-words"
                    style={{ color: "var(--text-muted)" }}
                    whileHover={{
                      backgroundColor: "color-mix(in srgb, var(--accent) 8%, transparent)",
                      color: "var(--text-secondary)",
                    }}
                    onClick={() => copyTitle(title, i)}
                  >
                    {copiedIndex === i ? "Copied!" : title}
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
