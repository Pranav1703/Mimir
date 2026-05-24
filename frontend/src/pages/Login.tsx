import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const NEON_CYAN = "#00f0ff";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(err instanceof Error ? err.message : "login failed");
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        <motion.h1
          className="text-3xl font-bold tracking-widest uppercase text-center mb-8"
          style={{
            textShadow: `0 0 20px ${NEON_CYAN}, 0 0 40px ${NEON_CYAN}66`,
            color: NEON_CYAN,
          }}
        >
          Login
        </motion.h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-[#12121a] border border-[#2a2a3a] rounded-lg px-4 py-3 text-sm outline-none transition-all focus:border-[#00f0ff] text-white placeholder:text-gray-600"
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#12121a] border border-[#2a2a3a] rounded-lg px-4 py-3 text-sm outline-none transition-all focus:border-[#00f0ff] text-white placeholder:text-gray-600"
          />

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-xs text-center"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={!username || !password}
            className="w-full rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-all disabled:opacity-30"
            style={{
              backgroundColor: `${NEON_CYAN}18`,
              color: NEON_CYAN,
              border: `1px solid ${NEON_CYAN}55`,
              boxShadow: `0 0 20px ${NEON_CYAN}22`,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Log in
          </motion.button>
        </form>

        <p className="text-gray-500 text-xs text-center mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#00f0ff] hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;
