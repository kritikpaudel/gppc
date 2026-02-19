import React from "react";
import { motion } from "framer-motion";

export default function Button({ variant="default", className="", ...props }){
  const base =
    "relative inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-[13px] " +
    "border border-white/10 bg-white/5 backdrop-blur-md " +
    "transition-[border-color,transform,filter] duration-200 " +
    "hover:border-white/18 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:hover:brightness-100";

  const primary =
    "border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,.10),rgba(255,255,255,.04))]";

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.985 }}
      className={`${base} ${variant==="primary" ? primary : ""} ${className}`}
      {...props}
    >
      {/* subtle shine */}
      <span
        className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200"
        style={{
          background:
            "radial-gradient(600px 180px at 20% 30%, rgba(124,255,203,.10), transparent 60%), radial-gradient(600px 180px at 85% 70%, rgba(122,168,255,.10), transparent 60%)"
        }}
      />
      <span className="relative">{props.children}</span>
    </motion.button>
  );
}
