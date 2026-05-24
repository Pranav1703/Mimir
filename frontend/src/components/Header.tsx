import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";

const NEON_CYAN = "#00f0ff";

function Header({ right }: { right?: ReactNode }) {
  const { user, logout } = useAuth();

  return (
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
          {right}
          <span className="text-xs text-gray-600">{user?.username}</span>
          <motion.button
            onClick={logout}
            className="text-xs uppercase tracking-widest text-red-400/60 hover:text-red-400 transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            Logout
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
