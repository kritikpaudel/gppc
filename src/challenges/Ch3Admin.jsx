import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import BackgroundFX from "../components/layout/BackgroundFX";
import TopBar from "../components/layout/TopBar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

import { EVENT_TITLE, CHALLENGES } from "../data/challenges";
import { useCtfStore } from "../state/useCtfStore";
import { formatTime } from "../lib/time";
import { useActiveTimer } from "../hooks/useActiveTimer";

import { ArrowLeft, ShieldAlert, BadgeCheck } from "lucide-react";
import { CH3_SESSION_KEY, CH3_FLAG } from "./Challenge3";

function getSession() {
  try {
    const raw = localStorage.getItem(CH3_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function Ch3Admin() {
  const navigate = useNavigate();
  const { state, setState, totals } = useCtfStore();

  const ch3Meta = CHALLENGES.find((c) => c.id === "ch3");
  const ch3Progress = state.challenges?.ch3;

  // ✅ Timer runs here too (admin is part of task)
  useActiveTimer({
    running: !!ch3Meta && !ch3Meta.comingSoon && ch3Progress?.status !== "submitted",
    onTick: (dt) => {
      setState((s) => ({
        ...s,
        challenges: {
          ...s.challenges,
          ch3: {
            ...(s.challenges.ch3 || {}),
            timeMs: (s.challenges.ch3?.timeMs || 0) + dt,
          },
        },
      }));
    },
  });

  const totalTime = formatTime(Math.floor((totals.totalTimeMs || 0) / 1000));

  const session = getSession();
  const role = String(session?.role || "none");
  const isAdmin = role.toLowerCase() === "admin";

  // ✅ Unlock the flag ONLY when they reach admin with admin role
  useEffect(() => {
    if (!isAdmin) return;

    setState((s) => ({
      ...s,
      challenges: {
        ...s.challenges,
        ch3: {
          ...(s.challenges.ch3 || {}),
          status: s.challenges.ch3?.status === "submitted" ? "submitted" : "unlocked",
          solvedAt: s.challenges.ch3?.solvedAt || Date.now(),
          revealedFlag: s.challenges.ch3?.revealedFlag || CH3_FLAG,
        },
      },
    }));
  }, [isAdmin, setState]);

  return (
    <div className="min-h-screen text-white">
      <BackgroundFX />
      <TopBar title={EVENT_TITLE} fullName={state.fullName} points={totals.totalPoints} time={totalTime} />

      <main className="mx-auto max-w-4xl px-5 pb-20 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-5"
        >
          <Link
            to="/challenge/ch3"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Challenge 3
          </Link>

          <Card className="p-6" hover={false}>
            <div className="text-xs tracking-[0.35em] text-white/55">ADMIN</div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Admin Panel</h1>
            <p className="mt-2 text-sm text-white/60">
              This area is restricted. Access requires an admin role.
            </p>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              Current role: <span className="text-white/90 font-medium">{role}</span>
            </div>

            {!isAdmin ? (
              <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4">
                <div className="flex items-center gap-2 text-rose-200 font-medium">
                  <ShieldAlert className="h-4 w-4" />
                  403 Unauthorized
                </div>
                <div className="mt-1 text-sm text-rose-100/80">
                  You don’t have an admin role in your stored session.
                </div>

                <div className="mt-4 flex gap-3">
                  <Button variant="ghost" onClick={() => navigate("/challenge/ch3")}>
                    Go to Portal
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                <div className="flex items-center gap-2 text-emerald-200 font-medium">
                  <BadgeCheck className="h-4 w-4" />
                  Welcome Admin
                </div>

                <div className="mt-2 text-sm text-emerald-100/80">
                  Flag unlocked. Submit it from the dashboard to record your score.
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs text-white/55">Flag</div>
                  <div className="mt-2 font-mono text-sm text-white/90 break-all">{CH3_FLAG}</div>
                </div>

                <div className="mt-4 flex gap-3">
                  <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
                  <Button variant="ghost" onClick={() => navigate("/challenge/ch3")}>
                    Back to Challenge
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </main>
    </div>
  );
}