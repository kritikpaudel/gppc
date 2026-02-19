import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { CHALLENGES, EVENT_TITLE } from "../data/challenges";
import { useCtfStore } from "../state/useCtfStore";
import { useActiveTimer } from "../hooks/useActiveTimer";
import { computePoints } from "../lib/scoring";
import { formatTime } from "../lib/time";

import BackgroundFX from "../components/layout/BackgroundFX";
import TopBar from "../components/layout/TopBar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

import Challenge1 from "../challenges/Challenge1";
import Challenge2 from "../challenges/Challenge2";

import { ArrowLeft, Timer, X, CheckCircle2 } from "lucide-react";

export default function Challenge() {
  const { id } = useParams();
  const navigate = useNavigate();
  const challenge = CHALLENGES.find((c) => c.id === id);

  const { state, setState, totals } = useCtfStore();
  const progress = challenge ? state.challenges[id] : null;

  const [flagModal, setFlagModal] = useState({ open: false, flag: "" });

  const totalTime = formatTime(Math.floor(totals.totalTimeMs / 1000));
  const seconds = Math.floor((progress?.timeMs || 0) / 1000);

  // attempts is now RETAKES
  const retakes = progress?.attempts || 0;

  // ✅ Active-only timer tick for this challenge:
  // Runs only while unsolved. Stops once flag is unlocked/submitted.
  useActiveTimer({
    running: !!challenge && !challenge.comingSoon && progress?.status === "unsolved",
    onTick: (dt) => {
      setState((s) => ({
        ...s,
        challenges: {
          ...s.challenges,
          [id]: {
            ...s.challenges[id],
            timeMs: (s.challenges[id].timeMs || 0) + dt,
          },
        },
      }));
    },
  });

  // Preview points IF they were to submit now (time + retakes only)
  const pointsPreview = useMemo(() => {
    if (!challenge) return 0;
    return computePoints({
      pointsMax: challenge.pointsMax,
      seconds,
      retakes,
    });
  }, [challenge, seconds, retakes]);

  // ✅ Called when challenge is solved INSIDE challenge page.
  // This only unlocks/reveals the flag.
  const markUnlocked = (flag) => {
    if (!challenge) return;

    setState((s) => ({
      ...s,
      challenges: {
        ...s.challenges,
        [id]: {
          ...s.challenges[id],
          status: "unlocked", // ✅ unlocked, not submitted
          solvedAt: Date.now(),
          revealedFlag: flag, // optional: helpful for admin/debug
        },
      },
    }));

    setFlagModal({ open: true, flag });
  };

  // ✅ Retake: reset progress and increment retakes counter
  const retakeChallenge = () => {
    if (!challenge) return;

    const ok = window.confirm(
      "Retake Challenge?\n\nThis will reset time and progress for this challenge on this device.\nRetake penalty: -10% per retake."
    );
    if (!ok) return;

    setFlagModal({ open: false, flag: "" });

    setState((s) => ({
      ...s,
      challenges: {
        ...s.challenges,
        [id]: {
          ...s.challenges[id],
          openedAt: null,
          timeMs: 0,
          solvedAt: null,
          submittedFlag: "",
          pointsAwarded: 0, // awarded only after dashboard submit
          attempts: (s.challenges[id].attempts || 0) + 1, // ✅ retakes++
          status: "unsolved",
          revealedFlag: "",
        },
      },
    }));
  };

  if (!challenge) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white p-10">
        <p className="text-white/70">Challenge not found.</p>
        <Link to="/" className="underline text-cyan-300">
          Back
        </Link>
      </div>
    );
  }

  if (challenge.comingSoon) {
    return (
      <div className="min-h-screen text-white">
        <BackgroundFX />
        <TopBar title={EVENT_TITLE} fullName={state.fullName} points={totals.totalPoints} time={totalTime} />

        <main className="mx-auto max-w-4xl px-5 pb-20 pt-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <Card className="p-8 mt-4" hover={false}>
            <div className="text-xs tracking-[0.35em] text-white/55">COMING SOON</div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">{challenge.title}</h1>
            <p className="mt-3 text-white/60">This challenge is not available yet.</p>
            <div className="mt-6">
              <Button variant="ghost" onClick={() => navigate("/")}>
                Go back
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const status = progress?.status || "unsolved"; // unsolved | unlocked | submitted

  return (
    <div className="min-h-screen text-white">
      <BackgroundFX />
      <TopBar title={EVENT_TITLE} fullName={state.fullName} points={totals.totalPoints} time={totalTime} />

      <main className="mx-auto max-w-5xl px-5 pb-20 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
                <Timer className="h-4 w-4" />
                {formatTime(seconds)}
              </div>

              <div className="hidden sm:block text-xs text-white/55 text-right">
                Points if submitted now:{" "}
                <span className="text-white/80 font-medium">{pointsPreview}</span>
                <div className="text-[11px] text-white/40 mt-0.5">
                  Retakes: <span className="text-white/70">{retakes}</span>
                </div>
              </div>
            </div>
          </div>

          {id === "ch1" ? (
            <Challenge1
              status={status}
              retakes={retakes}
              onUnlocked={markUnlocked}
              onBack={() => navigate("/")}
              onRetakeChallenge={retakeChallenge}
            />
          ) : id === "ch2" ? (
            <Challenge2
              status={status}
              retakes={retakes}
              onUnlocked={markUnlocked} // if you later want CH2 to unlock inside challenge
              onBack={() => navigate("/")}
              onRetakeChallenge={retakeChallenge}
            />
          ) : (
            <Card className="p-8" hover={false}>
              <div className="text-xs tracking-[0.35em] text-white/55">CHALLENGE</div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight">{challenge.title}</h1>
              <p className="mt-3 text-white/60">{challenge.description}</p>
              <div className="mt-6 text-white/60 text-sm">Content coming soon.</div>
            </Card>
          )}
        </motion.div>
      </main>

      {/* Flag Modal (Unlock only; submission is on dashboard) */}
      <AnimatePresence>
        {flagModal.open && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm px-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.98, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.98, y: 10, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-xl"
            >
              <Card className="p-6" hover={false}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
                      <CheckCircle2 className="h-5 w-5 text-emerald-200" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold tracking-tight">Flag Unlocked</div>
                      <div className="text-xs text-white/55">Now submit it on the dashboard to record your score.</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setFlagModal({ open: false, flag: "" })}
                    className="rounded-2xl border border-white/10 bg-white/5 p-2 hover:bg-white/10"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs text-white/55">Your Flag</div>
                  <div className="mt-2 font-mono text-sm text-white/90 break-all">
                    {flagModal.flag}
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setFlagModal({ open: false, flag: "" })}>
                    Close
                  </Button>
                  <Button onClick={() => navigate("/")}>Go to Dashboard</Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
