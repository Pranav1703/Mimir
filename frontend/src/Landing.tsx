import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

const NEON_CYAN = "#00f0ff";
const NEON_TEAL = "#00ffd5";

function Landing() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleAnalyze(e: FormEvent) {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    setLoading(true);
    // Simulate analyze - replace with actual backend call
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    navigate("/chat", { state: { repoUrl } });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center"
      >
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-widest uppercase mb-8"
          style={{
            textShadow: `0 0 30px ${NEON_CYAN}, 0 0 60px ${NEON_CYAN}66, 0 0 90px ${NEON_CYAN}33`,
            color: NEON_CYAN,
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Mimir
        </motion.h1>

        <motion.p
          className="text-gray-400 text-lg mb-12 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Analyze your codebase with AI-powered insights
        </motion.p>

        <motion.form
          onSubmit={handleAnalyze}
          className="flex flex-col items-center gap-4 w-full max-w-md mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <input
            type="url"
            placeholder="https://github.com/user/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="w-full bg-[#12121a] border rounded-full px-6 py-4 text-sm outline-none transition-all placeholder:text-gray-600 text-center text-white"
            style={{
              borderColor: repoUrl ? NEON_TEAL : "#2a2a3a",
              boxShadow: repoUrl ? `0 0 20px ${NEON_TEAL}33` : undefined,
            }}
          />

          <motion.button
            type="submit"
            disabled={loading || !repoUrl.trim()}
            className="relative rounded-full px-10 py-3 text-sm font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
            style={{
              backgroundColor: `${NEON_CYAN}18`,
              color: NEON_CYAN,
              border: `1px solid ${NEON_CYAN}55`,
              boxShadow: `0 0 20px ${NEON_CYAN}22`,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <motion.span
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Analyzing...
              </span>
            ) : (
              "Analyze"
            )}
          </motion.button>
        </motion.form>
      </motion.div>

      
    </div>
  );
}

export default Landing;