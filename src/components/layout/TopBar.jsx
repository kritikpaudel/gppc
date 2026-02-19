import { Link, useLocation, matchPath } from "react-router-dom";
import { Sparkles, Trophy, Timer } from "lucide-react";
import Pill from "../ui/Pill";

function getPageLabel(pathname) {
  if (pathname === "/") return "Dashboard";
  if (matchPath("/challenge/:id", pathname)) return "Challenge";
  if (pathname === "/admin") return "Admin"; // will be blocked anyway
  return "Mini CTF";
}

export default function TopBar({ title, fullName, points, time }) {
  const { pathname } = useLocation();
  const pageLabel = getPageLabel(pathname);

  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
            <Sparkles className="h-5 w-5 text-white" />
            <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-fuchsia-500/25 via-cyan-500/15 to-emerald-500/15 blur" />
          </div>
          <div className="leading-tight">
            <div className="text-sm text-white/70">{title}</div>
            <div className="text-base font-semibold tracking-tight">{pageLabel}</div>
          </div>
        </Link>

        {/* Center pills (global, okay everywhere) */}
        <div className="hidden items-center gap-2 md:flex">
          <Pill label="Player" value={fullName?.trim() ? fullName : "—"} />
          <Pill label="Points" value={points} />
          <Pill label="Time" value={time} />
        </div>

        {/* Right compact HUD (no Admin button) */}
        <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90">
          <Trophy className="h-4 w-4 opacity-80" />
          {points}
          <span className="mx-1 text-white/25">•</span>
          <Timer className="h-4 w-4 opacity-80" />
          {time}
        </div>
      </div>
    </div>
  );
}
