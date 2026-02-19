import { motion } from "framer-motion";

export default function Card({ className = "", children, hover = true }) {
  return (
    <motion.div
      whileHover={hover ? { y: -3 } : undefined}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={[
        "relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_20px_60px_rgba(0,0,0,0.55)]",
        className,
      ].join(" ")}
    >
      {/* inner highlight */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(255,255,255,0.10),transparent_50%)]" />
      {children}
    </motion.div>
  );
}
