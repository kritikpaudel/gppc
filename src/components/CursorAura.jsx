import React, { useEffect, useRef } from "react";

export default function CursorAura(){
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if(!el) return;

    let x = 0, y = 0;
    let tx = 0, ty = 0;

    const onMove = (e) => { tx = e.clientX; ty = e.clientY; };
    window.addEventListener("mousemove", onMove, { passive: true });

    let rafId;
    const loop = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      el.style.transform = `translate3d(${x - 180}px, ${y - 180}px, 0)`;
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed left-0 top-0 z-[5] h-[360px] w-[360px] rounded-full"
      style={{
        background:
          "radial-gradient(circle at 30% 30%, rgba(51,246,255,.20), transparent 55%), radial-gradient(circle at 70% 70%, rgba(255,79,216,.16), transparent 60%)",
        filter: "blur(18px)",
        opacity: 0.9,
        mixBlendMode: "screen",
      }}
    />
  );
}
