import { Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import BackgroundFX from "../components/layout/BackgroundFX";
import TopBar from "../components/layout/TopBar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { EVENT_TITLE, CHALLENGES } from "../data/challenges";
import { useCtfStore } from "../state/useCtfStore";
import { formatTime } from "../lib/time";
import { ArrowLeft } from "lucide-react";

const ADMIN_KEY_LS = "mini_ctf_admin_enabled_v1";

const isLocalhost = () => {
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h === "::1";
};

const isAdminEnabled = () => localStorage.getItem(ADMIN_KEY_LS) === "1";

/**
 * HARD BLOCK:
 * - If not localhost => NEVER allow /admin (even if someone types it)
 * - If localhost but not unlocked with secret => block
 */
export default function Admin() {
  if (!isLocalhost()) return <Navigate to="/" replace />;
  if (!isAdminEnabled()) return <Navigate to="/" replace />;

  const { state, totals } = useCtfStore();
  const totalTime = formatTime(Math.floor(totals.totalTimeMs / 1000));

  return (
    <div className="min-h-screen text-white">
      <BackgroundFX />
      <TopBar
        title={EVENT_TITLE}
        fullName={state.fullName}
        points={totals.totalPoints}
        time={totalTime}
      />

      <main className="mx-auto max-w-5xl px-5 pb-20 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="space-y-4"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <Card className="p-6" hover={false}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Admin View (Localhost Only)
                </h1>
                <p className="mt-2 text-white/60 text-sm">
                  This page is blocked on hosted/network sites. It works only on this device
                  running <span className="text-white/80">localhost</span>.
                </p>
              </div>

              <Button
                variant="ghost"
                onClick={() => {
                  localStorage.removeItem(ADMIN_KEY_LS);
                  window.location.href = "/";
                }}
              >
                Lock Admin
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/55">Player (This Browser)</div>
                <div className="mt-1 font-semibold">{state.fullName || "—"}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/55">Total Points</div>
                <div className="mt-1 font-semibold">{totals.totalPoints}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/55">Total Time</div>
                <div className="mt-1 font-semibold">{totalTime}</div>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              <div className="grid grid-cols-6 bg-white/5 px-4 py-3 text-xs text-white/55">
                <div className="col-span-2">Challenge</div>
                <div>Status</div>
                <div>Attempts</div>
                <div>Time</div>
                <div>Points</div>
              </div>

              {CHALLENGES.map((c) => {
                const p = state.challenges[c.id];
                return (
                  <div
                    key={c.id}
                    className="grid grid-cols-6 px-4 py-3 text-sm border-t border-white/10"
                  >
                    <div className="col-span-2 text-white/85">{c.title}</div>
                    <div className="text-white/70">{p?.status}</div>
                    <div className="text-white/70">{p?.attempts || 0}</div>
                    <div className="text-white/70">
                      {formatTime(Math.floor((p?.timeMs || 0) / 1000))}
                    </div>
                    <div className="text-white/85 font-medium">{p?.pointsAwarded || 0}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
