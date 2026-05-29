import { motion } from "motion/react";

export default function LoadingSpinner({ size = 20 }: { size?: number }) {
  return (
    <motion.div
      className="rounded-full border-2"
      style={{
        width: size,
        height: size,
        borderColor: "color-mix(in srgb, var(--accent) 20%, transparent)",
        borderTopColor: "var(--accent)",
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    />
  );
}
