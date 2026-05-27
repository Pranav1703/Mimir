import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function Header({ right }: { right?: ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header
      className="border-b"
      style={{ borderColor: "color-mix(in srgb, var(--accent) 13%, transparent)" }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <motion.h1
          className="text-2xl font-bold tracking-widest uppercase"
          style={{
            textShadow: "0 0 20px var(--accent), 0 0 40px color-mix(in srgb, var(--accent) 40%, transparent)",
            color: "var(--accent)",
          }}
        >
          Briefly
        </motion.h1>
        <div className="flex items-center gap-3">
          {right}
          <span className="text-xs text-(--text-muted)">{user?.username}</span>
          <motion.button
            onClick={toggleTheme}
            className="text-sm transition-colors"
            style={{ color: "var(--accent)" }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </motion.button>
          <motion.button
            onClick={logout}
            className="text-xs uppercase tracking-widest transition-colors"
            style={{ color: "color-mix(in srgb, var(--error) 60%, transparent)" }}
            whileHover={{ scale: 1.05 }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--error)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "color-mix(in srgb, var(--error) 60%, transparent)"}
          >
            Logout
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
