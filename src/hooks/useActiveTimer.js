import { useEffect, useRef } from "react";

const INACTIVITY_TIMEOUT_MS = 25_000;
const HEARTBEAT_MS = 1_000;

export function useActiveTimer({ running, onTick }) {
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    const mark = () => (lastActivityRef.current = Date.now());
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, mark, { passive: true }));

    const onVisibility = () => {
      if (document.visibilityState === "visible") mark();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      events.forEach((e) => window.removeEventListener(e, mark));
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!running) return;

    let last = Date.now();
    const t = setInterval(() => {
      const now = Date.now();
      const dt = now - last;
      last = now;

      const visible = document.visibilityState === "visible";
      const active = now - lastActivityRef.current <= INACTIVITY_TIMEOUT_MS;

      if (visible && active) onTick(dt);
    }, HEARTBEAT_MS);

    return () => clearInterval(t);
  }, [running, onTick]);
}
