import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function MagneticButton({ children, className="", ...props }){
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 20 });
  const sy = useSpring(y, { stiffness: 260, damping: 20 });

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if(!r) return;
    const dx = e.clientX - (r.left + r.width/2);
    const dy = e.clientY - (r.top + r.height/2);
    x.set(dx * 0.18);
    y.set(dy * 0.18);
  };

  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={[
        "relative overflow-hidden rounded-xl2 px-4 py-2",
        "border border-white/15 text-white",
        "bg-white/5 backdrop-blur-md shadow-neon",
        "transition-[filter,border-color] duration-200",
        "hover:border-cyan-300/40 hover:brightness-110 active:scale-[0.99]",
        className
      ].join(" ")}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <span
        className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200"
        style={{
          background:
            "radial-gradient(520px 160px at 20% 30%, rgba(51,246,255,.16), transparent 60%), radial-gradient(520px 160px at 85% 70%, rgba(255,79,216,.12), transparent 60%)"
        }}
      />
    </motion.button>
  );
}
