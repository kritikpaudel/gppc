import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { CHALLENGES, EVENT_TITLE } from "../data/challenges";
import { useCtfStore } from "../state/useCtfStore";
import { formatTime } from "../lib/time";
import { computePoints } from "../lib/scoring";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import TopBar from "../components/layout/TopBar";
import BackgroundFX from "../components/layout/BackgroundFX";

import {
  ArrowRight,
  Lock,
  Trophy,
  Timer,
  ShieldCheck,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

const FLAGS = {
  ch1: "FL@G{Woohoo_C0ng0_U_D!d_It}",
  ch2: "FL@G{lD0R_M@ster?}",
};

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

function Toast({ ok, msg }) {
  if (!msg) return null;

  return (
    <div
      className={[
        "fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-2xl border px-4 py-2 text-xs backdrop-blur",
        ok
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
          : "border-rose-400/20 bg-rose-400/10 text-rose-200",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        {ok ? <CheckCircle2 className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
        {msg}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { state, setState, totals } = useCtfStore();

  const totalTime = formatTime(Math.floor(totals.totalTimeMs / 1000));
  const availableCount = CHALLENGES.filter((c) => !c.comingSoon).length;

  const [flagInputs, setFlagInputs] = useState(() =>
    Object.fromEntries(CHALLENGES.map((c) => [c.id, ""]))
  );

  const [toast, setToast] = useState({ ok: false, msg: "" });
  const showToast = (ok, msg) => {
    setToast({ ok, msg });
    if (msg) setTimeout(() => setToast({ ok: false, msg: "" }), 1600);
  };
  const exportResults = () => {
    const payload = {
      app: "gppc-mini-ctf",
      version: 2,
      exportedAt: new Date().toISOString(),
      fullName: state.fullName || "",
      totals,
      challenges: state.challenges,
    };

    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: "application/json" });

    const safeName = (state.fullName || "team")
      .trim()
      .replace(/[^\w\-]+/g, "_")
      .slice(0, 40);

    const fileName = `ctf-results_${safeName || "team"}_${Date.now()}.json`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    showToast(true, "Exported results JSON");
  };


  const submitFlag = (challengeId) => {
    const expected = FLAGS[challengeId];
    const entered = (flagInputs[challengeId] || "").trim();

    const meta = CHALLENGES.find((c) => c.id === challengeId);
    if (!meta) return;

    const progress = state.challenges[challengeId];
    if (!progress) return;

    if (meta.comingSoon) {
      showToast(false, "This challenge is coming soon.");
      return;
    }

    if (!expected) {
      showToast(false, "Submission not configured for this challenge.");
      return;
    }

    // ✅ Must unlock flag inside challenge first
    if (progress.status !== "unlocked") {
      showToast(false, "Unlock the flag in the challenge first, then submit it here.");
      return;
    }

    // Wrong flag => show error, NO penalty
    if (entered !== expected) {
      showToast(false, "Incorrect flag.");
      return;
    }

    const seconds = Math.floor((progress.timeMs || 0) / 1000);
    const retakes = progress.attempts || 0; // attempts repurposed as retakes

    const awarded = computePoints({
      pointsMax: meta.pointsMax,
      seconds,
      retakes,
    });

    // ✅ Now finalize: submitted + award points
    setState((s) => ({
      ...s,
      challenges: {
        ...s.challenges,
        [challengeId]: {
          ...s.challenges[challengeId],
          status: "submitted",
          pointsAwarded: awarded,
          submittedFlag: entered,
          submittedAt: Date.now(),
        },
      },
    }));

    showToast(true, `Submitted! +${awarded} points recorded`);
  };

  const pointsPreviewById = useMemo(() => {
    const out = {};
    for (const c of CHALLENGES) {
      const p = state.challenges[c.id];
      if (!p) continue;

      if (p.status === "submitted") {
        out[c.id] = p.pointsAwarded || 0;
      } else {
        const seconds = Math.floor((p.timeMs || 0) / 1000);
        const retakes = p.attempts || 0;
        out[c.id] = computePoints({ pointsMax: c.pointsMax, seconds, retakes });
      }
    }
    return out;
  }, [state.challenges]);

  return (
    <div className="min-h-screen text-white">
      <BackgroundFX />
      <TopBar title={EVENT_TITLE} fullName={state.fullName} points={totals.totalPoints} time={totalTime} />
      <Toast ok={toast.ok} msg={toast.msg} />

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
            <Stat
              icon={ShieldCheck}
              label="Solved"
              value={`${totals.solvedCount}/${availableCount}`}
              sub="Challenges completed"
            />
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

          {/* Challenges header */}
          <div className="flex items-end justify-between gap-4 mt-2">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Challenges</h2>
              <p className="text-sm text-white/55">
                Unlock flag inside the challenge, then submit it here to record score.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs text-white/45 hidden sm:block">
                Points decrease with time + (-10% per retake).
              </div>

              <Button
                variant="ghost"
                onClick={exportResults}
                disabled={!state.fullName.trim()}
                className={!state.fullName.trim() ? "opacity-50" : ""}
              >
                Export JSON
              </Button>
            </div>
          </div>


          {/* Challenge cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CHALLENGES.map((c) => {
              const progress = state.challenges[c.id];
              const disabledOpen = !state.fullName.trim() || c.comingSoon;

              const status = progress?.status || "unsolved"; // unsolved | unlocked | submitted
              const unlocked = status === "unlocked";
              const submitted = status === "submitted";

              const timeStr = formatTime(Math.floor((progress?.timeMs || 0) / 1000));
              const retakes = progress?.attempts || 0;

              return (
                <Card key={c.id} className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold tracking-tight">{c.title}</div>
                      <div className="mt-1 text-xs text-white/55">
                        {c.category} • <span className="text-white/80">{c.pointsMax} pts</span>
                        <span className="text-white/35"> • </span>
                        <span className="text-white/70">Score now: </span>
                        <span className="text-white/85 font-medium">{pointsPreviewById[c.id] ?? 0}</span>
                      </div>
                    </div>

                    {c.comingSoon ? (
                      <span className="inline-flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                        <Lock className="h-3.5 w-3.5" />
                        Coming soon
                      </span>
                    ) : submitted ? (
                      <span className="inline-flex items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                        Submitted
                      </span>
                    ) : unlocked ? (
                      <span className="inline-flex items-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                        Flag Unlocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                        Unsolved
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-sm text-white/60">{c.description}</p>

                  <div className="mt-5 flex items-center justify-between">
                    <div className="text-xs text-white/50 space-y-1">
                      <div>
                        Time: <span className="text-white/80 font-medium">{timeStr}</span>
                      </div>
                      <div>
                        Retakes: <span className="text-white/80 font-medium">{retakes}</span>
                      </div>
                    </div>

                    <Link to={`/challenge/${c.id}`}>
                      <Button disabled={disabledOpen} className={disabledOpen ? "opacity-50" : ""}>
                        Open
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>

                  {/* Submit flag block */}
                  {!c.comingSoon && (
                    <div className="mt-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                      <div>
                        <div className="text-xs text-white/55 mb-2">Submit flag</div>
                        <Input
                          value={flagInputs[c.id] || ""}
                          onChange={(e) => setFlagInputs((s) => ({ ...s, [c.id]: e.target.value }))}
                          placeholder={submitted ? "Submitted" : unlocked ? "Paste flag here…" : "Unlock flag in challenge first"}
                          className="font-mono"
                          disabled={submitted || !unlocked}
                        />
                      </div>

                      <Button
                        onClick={() => submitFlag(c.id)}
                        disabled={submitted || !unlocked}
                        className={submitted || !unlocked ? "opacity-50" : ""}
                        title={!unlocked ? "Unlock the flag first" : submitted ? "Already submitted" : "Submit flag"}
                      >
                        Submit
                      </Button>
                    </div>
                  )}

                  {submitted && (
                    <div className="mt-3 text-xs text-white/45">
                      Score recorded. Awarded:{" "}
                      <span className="text-white/80 font-medium">{progress?.pointsAwarded || 0}</span>{" "}
                      pts
                    </div>
                  )}

                  {c.id === "ch2" && !c.comingSoon && (
                    <div className="mt-4">
                      <Button
                        variant="ghost"
                        onClick={() => navigate("/challenge/ch2/profile?id=1")}
                        disabled={!state.fullName.trim()}
                        className={!state.fullName.trim() ? "opacity-50" : ""}
                      >
                        View Profiles
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
