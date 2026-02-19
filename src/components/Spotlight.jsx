import React, { useEffect, useRef } from "react";

export default function Spotlight(){
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if(!el) return;

    let x = 0, y = 0, tx = 0, ty = 0;

    const onMove = (e) => { tx = e.clientX; ty = e.clientY; };
    window.addEventListener("mousemove", onMove, { passive: true });

    let raf;
    const loop = () => {
      x += (tx - x) * 0.10;
      y += (ty - y) * 0.10;
      el.style.transform = `translate3d(${x - 240}px, ${y - 240}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed left-0 top-0 z-[3] h-[480px] w-[480px] rounded-full"
      style={{
        background:
          "radial-gradient(circle at 30% 30%, rgba(122,168,255,.16), transparent 58%), radial-gradient(circle at 70% 70%, rgba(255,123,209,.10), transparent 62%)",
        filter: "blur(22px)",
        opacity: 0.9,
        mixBlendMode: "screen",
      }}
    />
  );
}
