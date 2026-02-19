import React from "react";
import { motion } from "framer-motion";

export default function Card({ className="", children }){
  return (
    <motion.section
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className={`glass rounded-3xl shadow-[0_28px_90px_rgba(0,0,0,.45)] overflow-hidden ${className}`}
    >
      {children}
    </motion.section>
  );
}
