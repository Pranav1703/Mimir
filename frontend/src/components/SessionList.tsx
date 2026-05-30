import { motion, AnimatePresence } from "motion/react";
import type { Session } from "../api/articles";

export default function SessionList({
  open,
  sessions,
  activeSessionId,
  onSelect,
  onDelete,
  onNewChat,
}: {
  open: boolean;
  sessions: Session[];
  activeSessionId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
}) {
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
          <div className="px-4 py-4 border-b flex items-center justify-between" style={{ borderColor: "color-mix(in srgb, var(--accent) 13%, transparent)" }}>
            <h2 className="text-xs uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>
              Sessions
            </h2>
            <motion.button
              onClick={onNewChat}
              className="shrink-0 rounded-lg w-6 h-6 flex items-center justify-center text-xs transition-colors"
              style={{ color: "var(--accent)" }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              title="New chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </motion.button>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {sessions.length === 0 ? (
              <p className="px-4 py-6 text-xs text-center" style={{ color: "var(--text-dim)" }}>
                No sessions yet
              </p>
            ) : (
              <ul className="space-y-0.5 px-2">
                {sessions.map((s) => (
                  <motion.li
                    key={s.id}
                    className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors break-words flex items-center justify-between group ${
                      activeSessionId === s.id ? "bg-(--accent)/10" : ""
                    }`}
                    style={{
                      color: activeSessionId === s.id ? "var(--text-secondary)" : "var(--text-muted)",
                      backgroundColor: activeSessionId === s.id ? "color-mix(in srgb, var(--accent) 8%, transparent)" : undefined,
                    }}
                    whileHover={{
                      backgroundColor: "color-mix(in srgb, var(--accent) 8%, transparent)",
                      color: "var(--text-secondary)",
                    }}
                    onClick={() => onSelect(s.id)}
                  >
                    <span className="truncate">{s.title}</span>
                    <motion.button
                      onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                      className="shrink-0 rounded w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: "color-mix(in srgb, var(--error) 60%, transparent)" }}
                      whileHover={{ scale: 1.2, color: "var(--error)" }}
                      title="Delete session"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </motion.button>
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
