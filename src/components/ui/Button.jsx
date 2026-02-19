import { motion } from "framer-motion";

export default function Button({
  className = "",
  children,
  variant = "primary", // primary | ghost
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-white/20";
  const styles =
    variant === "primary"
      ? "bg-white text-neutral-900 hover:bg-white/90"
      : "bg-white/5 text-white hover:bg-white/10 border border-white/10";

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={[base, styles, className].join(" ")}
      {...props}
    >
      {children}
    </motion.button>
  );
}
