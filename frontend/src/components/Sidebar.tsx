import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getTitles } from "../api/articles";

export default function Sidebar({ open }: { open: boolean }) {
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
          className="absolute left-0 inset-y-0 w-64 z-10 border-r overflow-hidden flex flex-col bg-(--bg-primary)"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 13%, transparent)" }}
          initial={{ opacity: 0, x: -64 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -64 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="px-4 py-4 border-b" style={{ borderColor: "color-mix(in srgb, var(--accent) 13%, transparent)" }}>
            <h2 className="text-xs uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>
              Saved Articles
            </h2>
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
