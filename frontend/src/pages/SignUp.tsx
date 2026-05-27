import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function SignUp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signup, login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await signup(username, password);
      await login(username, password);
      navigate("/");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(err instanceof Error ? err.message : "signup failed");
      }
    }
  }

  return (
    <div className="min-h-screen bg-(--bg-primary) flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        <motion.h1
          className="text-3xl font-bold tracking-widest uppercase text-center mb-8"
          style={{
            textShadow: "0 0 20px var(--accent), 0 0 40px color-mix(in srgb, var(--accent) 40%, transparent)",
            color: "var(--accent)",
          }}
        >
          Sign Up
        </motion.h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-(--bg-surface) border border-(--border-default) rounded-lg px-4 py-3 text-sm outline-none transition-all text-(--text-primary) placeholder:text-(--text-dim)"
            onFocus={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
            onBlur={(e) => e.currentTarget.style.borderColor = ""}
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-(--bg-surface) border border-(--border-default) rounded-lg px-4 py-3 text-sm outline-none transition-all text-(--text-primary) placeholder:text-(--text-dim)"
            onFocus={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
            onBlur={(e) => e.currentTarget.style.borderColor = ""}
          />

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-(--error) text-xs text-center"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={!username || !password}
            className="w-full rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-all disabled:opacity-30"
            style={{
              backgroundColor: "color-mix(in srgb, var(--accent) 9%, transparent)",
              color: "var(--accent)",
              border: "1px solid color-mix(in srgb, var(--accent) 33%, transparent)",
              boxShadow: "0 0 20px color-mix(in srgb, var(--accent) 13%, transparent)",
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign up
          </motion.button>
        </form>

        <p className="text-(--text-dim) text-xs text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-(--accent) hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default SignUp;
