import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CHALLENGES, EVENT_TITLE } from "../data/challenges";
import { useCtfStore } from "../state/useCtfStore";
import { formatTime } from "../lib/time";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import TopBar from "../components/layout/TopBar";
import BackgroundFX from "../components/layout/BackgroundFX";
import { ArrowRight, Lock, Trophy, Timer, ShieldCheck } from "lucide-react";

function Stat({ icon: Icon, label, value, sub }) {
  return (
    <Card className="p-5" hover>
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 border border-white/10">
          <Icon className="h-5 w-5 text-white/85" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-white/55">{label}</div>
          <div className="text-xl font-semibold tracking-tight">{value}</div>
          <div className="text-xs text-white/45 mt-1">{sub}</div>
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { state, setState, totals } = useCtfStore();

  const totalTime = formatTime(Math.floor(totals.totalTimeMs / 1000));
  const availableCount = CHALLENGES.filter((c) => !c.comingSoon).length;

  return (
    <div className="min-h-screen text-white">
      <BackgroundFX />
      <TopBar title={EVENT_TITLE} fullName={state.fullName} points={totals.totalPoints} time={totalTime} />

      <main className="mx-auto max-w-6xl px-5 pb-20 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 gap-6"
        >
          {/* Hero */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Solve challenges. <span className="text-white/60">Capture flags.</span>
            </h1>
            <p className="text-white/60 max-w-2xl">
              No signup. Just enter your name and start. Timers count only when you’re active on the page.
            </p>
          </div>

          {/* Top stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Stat icon={Trophy} label="Points" value={totals.totalPoints} sub="Time-weighted score" />
            <Stat icon={Timer} label="Total Time" value={totalTime} sub="Active time only" />
            <Stat icon={ShieldCheck} label="Solved" value={`${totals.solvedCount}/${availableCount}`} sub="Challenges completed" />
          </div>

          {/* Team Info */}
          <Card className="p-6" hover={false}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs tracking-[0.35em] text-white/55">TEAM INFORMATION</div>
                <div className="mt-2 text-sm text-white/60">
                  Enter your full name to unlock challenges. No account required.
                </div>
              </div>
              <div className="hidden md:block text-xs text-white/40">
                Tip: use one device per team for clean timing.
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-white/55 mb-2">Full Name</div>
                <Input
                  value={state.fullName}
                  onChange={(e) => setState((s) => ({ ...s, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="flex items-end justify-end">
                <Button
                  variant="ghost"
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      fullName: s.fullName.trim(),
                    }))
                  }
                >
                  Save
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!state.fullName.trim() && (
              <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                Enter your full name to enable “Open”.
              </div>
            )}
          </Card>

          {/* Challenges */}
          <div className="flex items-end justify-between gap-4 mt-2">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Challenges</h2>
              <p className="text-sm text-white/55">
                Open a challenge to start its timer. Timers pause when you’re inactive or tab is hidden.
              </p>
            </div>
            <Link to="/admin">
              <Button variant="ghost">Admin View</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CHALLENGES.map((c) => {
              const progress = state.challenges[c.id];
              const disabled = !state.fullName.trim() || c.comingSoon;

              return (
                <Card key={c.id} className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold tracking-tight">{c.title}</div>
                      <div className="mt-1 text-xs text-white/55">
                        {c.category} • <span className="text-white/80">{c.pointsMax} pts</span>
                      </div>
                    </div>

                    {c.comingSoon ? (
                      <span className="inline-flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                        <Lock className="h-3.5 w-3.5" />
                        Coming soon
                      </span>
                    ) : progress?.status === "solved" ? (
                      <span className="inline-flex items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                        Solved
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                        Unsolved
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-sm text-white/60">{c.description}</p>

                  <div className="mt-5 flex items-center justify-between">
                    <div className="text-xs text-white/50">
                      Time:{" "}
                      <span className="text-white/80 font-medium">
                        {formatTime(Math.floor((progress?.timeMs || 0) / 1000))}
                      </span>
                    </div>

                    <Link to={`/challenge/${c.id}`}>
                      <Button disabled={disabled} className={disabled ? "opacity-50" : ""}>
                        Open
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
