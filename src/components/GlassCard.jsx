import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function GlassCard({ children, className="" }){
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const x = useMotionValue(50);
  const y = useMotionValue(30);
  const srx = useSpring(rx, { stiffness: 220, damping: 22 });
  const sry = useSpring(ry, { stiffness: 220, damping: 22 });

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if(!r) return;
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    rx.set((py - 0.5) * -6);
    ry.set((px - 0.5) * 8);
    x.set(px * 100);
    y.set(py * 100);
  };

  const onLeave = () => { rx.set(0); ry.set(0); };

  return (
    <motion.section
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transformStyle: "preserve-3d",
        rotateX: srx,
        rotateY: sry,
      }}
      className={[
        "relative rounded-xl3 border border-white/15 shadow-neon overflow-hidden",
        "bg-[linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.02))]",
        className
      ].join(" ")}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{
          background: `radial-gradient(800px 260px at ${x.get()}% ${y.get()}%, rgba(51,246,255,.14), transparent 55%)`
        }}
      />
      <div className="relative">{children}</div>
    </motion.section>
  );
}
