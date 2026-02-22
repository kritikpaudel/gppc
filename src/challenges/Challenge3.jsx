import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import BackgroundFX from "../components/layout/BackgroundFX";
import TopBar from "../components/layout/TopBar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

import { Shield, Info, KeyRound, ArrowRight, RotateCcw, Timer } from "lucide-react";

import { EVENT_TITLE, CHALLENGES } from "../data/challenges";
import { useCtfStore } from "../state/useCtfStore";
import { formatTime } from "../lib/time";
import { useActiveTimer } from "../hooks/useActiveTimer";
import { computePoints } from "../lib/scoring";

export const CH3_SESSION_KEY = "mini_ctf_ch3_session_v1";
export const CH3_FLAG = "FL@G{ClientSide_Is_Not_Security}";

function safeParse(json) {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function readSessionRaw() {
  return localStorage.getItem(CH3_SESSION_KEY) || "";
}

function writeSession(sessionObj) {
  localStorage.setItem(CH3_SESSION_KEY, JSON.stringify(sessionObj));
}

function clearSessionKey() {
  localStorage.removeItem(CH3_SESSION_KEY);
}

function ChoiceCard({ title, description, picked, onPick }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={[
        "w-full text-left rounded-2xl border px-4 py-3 transition",
        picked ? "border-white/20 bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/7",
      ].join(" ")}
    >
      <div className="text-sm font-semibold text-white/90">{title}</div>
      <div className="mt-1 text-sm text-white/60 leading-relaxed">{description}</div>
    </button>
  );
}

export default function Challenge3({ solved = false, onBack, onRetakeChallenge }) {
  const navigate = useNavigate();
  const { state, setState, totals } = useCtfStore();

  const ch3Meta = CHALLENGES.find((c) => c.id === "ch3");
  const progress = state.challenges?.ch3 || {};

  // Run challenge timer here too
  useActiveTimer({
    running: !!ch3Meta && !ch3Meta.comingSoon && progress?.status !== "submitted",
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

  // Global top bar time
  const totalTime = formatTime(Math.floor((totals.totalTimeMs || 0) / 1000));

  // Challenge-specific time
  const chSeconds = Math.floor((progress?.timeMs || 0) / 1000);
  const chTime = formatTime(chSeconds);

  // Retakes
  const retakes = progress?.retakes || 0;

  // Points if submitted now
  const pointsMax = ch3Meta?.pointsMax || 0;
  const pointsIfNow = computePoints({ pointsMax, seconds: chSeconds, retakes });

  // Hint unlock after 3 minutes
  const hintVisible = chSeconds >= 180;

  // Info CTF flow
  const [tab, setTab] = useState("info"); // info | task
  const [username, setUsername] = useState(state.fullName?.trim() ? state.fullName.trim() : "");
  const [password, setPassword] = useState("");

  const [sessionRaw, setSessionRaw] = useState("");
  useEffect(() => {
    setSessionRaw(readSessionRaw());
  }, []);

  useEffect(() => {
    if (state.fullName?.trim()) setUsername(state.fullName.trim());
  }, [state.fullName]);

  useEffect(() => {
    setSessionRaw(readSessionRaw());
  }, [tab]);

  const session = useMemo(() => safeParse(sessionRaw), [sessionRaw]);

  const login = () => {
    const newSession = {
      username: (username || "user").trim() || "user",
      role: "user",
      issuedAt: Date.now(),
    };
    writeSession(newSession);
    setSessionRaw(JSON.stringify(newSession));
  };

  const clearLocalSession = () => {
    clearSessionKey();
    setSessionRaw("");
  };

  // Fix: show flag only if revealedFlag exists
  const showUnlockedStatus =
    (progress?.status === "unlocked" || progress?.status === "submitted") &&
    !!progress?.revealedFlag;

  // Minimal interactive bits for the Basics tab
  const [pick, setPick] = useState(null); // "friend" | "guard"
  const [step, setStep] = useState(0); // 0..2

  return (
    <div className="min-h-screen text-white">
      <BackgroundFX />
      <TopBar title={EVENT_TITLE} fullName={state.fullName} points={totals.totalPoints} time={totalTime} />

      <main className="mx-auto max-w-5xl px-5 pb-20 pt-10">
        {/* Challenge2-style header strip (same alignment, no emojis) */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <Button variant="ghost" onClick={onBack} className="inline-flex items-center gap-2">
            ← Back to Dashboard
          </Button>

          <div className="flex flex-wrap items-start gap-6">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              <Timer className="h-4 w-4 opacity-80" />
              <span>{chTime}</span>
            </div>

            <div className="text-right">
              <div className="text-sm text-white/70">
                Points if submitted now:{" "}
                <span className="text-white/90 font-semibold">{pointsIfNow}</span>
              </div>
              <div className="text-xs text-white/45">Retakes: {retakes}</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Header Card (unchanged) */}
          <Card className="p-6" hover={false}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs tracking-[0.35em] text-white/55">CHALLENGE 03</div>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  Client Trust — Role Based Access
                </h2>
                <p className="mt-3 text-white/60 text-sm leading-relaxed">
                  Read the basics first (simple words), then do the task.
                </p>
              </div>

              {solved || showUnlockedStatus ? (
                <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200">
                  Unlocked
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button variant={tab === "info" ? "primary" : "ghost"} onClick={() => setTab("info")}>
                <Info className="h-4 w-4" />
                Basics
              </Button>

              <Button variant={tab === "task" ? "primary" : "ghost"} onClick={() => setTab("task")}>
                <Shield className="h-4 w-4" />
                Start Task
              </Button>

              <div className="flex-1" />

              <Button variant="ghost" onClick={onRetakeChallenge}>
                <RotateCcw className="h-4 w-4" />
                Retake (-10%)
              </Button>
            </div>
          </Card>

          {/* INFO TAB (updated only here) */}
          {tab === "info" && (
            <Card className="p-6" hover={false}>
              <div className="text-xs tracking-[0.35em] text-white/55">BASICS</div>

              <div className="mt-4 space-y-4 text-sm text-white/70 leading-relaxed">
                <div>
                  <div className="text-white/90 font-medium">A simple story</div>
                  <div className="mt-1 text-white/60">
                    Imagine a building with two rooms: a public room and an admin room. The important part is:
                    who checks your badge before you enter the admin room?
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ChoiceCard
                    title="Your friend checks your badge"
                    description="Your friend says you are admin, so you walk in."
                    picked={pick === "friend"}
                    onPick={() => setPick("friend")}
                  />
                  <ChoiceCard
                    title="A security guard checks your badge"
                    description="A guard checks your badge every time before opening the admin door."
                    picked={pick === "guard"}
                    onPick={() => setPick("guard")}
                  />
                </div>

                {pick && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60">
                    <div className="text-white/85 font-medium">What this teaches</div>
                    <div className="mt-1">
                      {pick === "guard"
                        ? "This is safer. Important checks should be done by the website side, not only by the browser."
                        : "This is risky. If the website trusts the browser too much, someone can pretend."}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60">
                  <div className="text-white/85 font-medium">Quick definitions</div>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="text-white/80 font-medium">Role:</span>{" "}
                      A label like user or admin that decides what you can open.
                    </div>
                    <div>
                      <span className="text-white/80 font-medium">Session:</span>{" "}
                      A small saved note that can include your username and role.
                    </div>
                    <div>
                      <span className="text-white/80 font-medium">Client-side vs server-side:</span>{" "}
                      Client-side means the browser decides. Server-side means the website decides.
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60">
                  <div className="text-white/85 font-medium">Mini walk-through</div>
                  <div className="mt-2 text-white/60">
                    Step {step + 1} of 3
                  </div>
                  <div className="mt-2">
                    {step === 0 &&
                      "You press Login. The site saves a session in your browser so it remembers you."}
                    {step === 1 &&
                      "You try the admin page. The admin page checks the role inside the saved session."}
                    {step === 2 &&
                      "If a website trusts that saved role without strong checks, restricted pages can be exposed."}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setStep((s) => Math.max(0, s - 1))}
                      disabled={step === 0}
                      className={step === 0 ? "opacity-50" : ""}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setStep((s) => Math.min(2, s + 1))}
                      disabled={step === 2}
                      className={step === 2 ? "opacity-50" : ""}
                    >
                      Next
                    </Button>

                    <div className="flex-1" />

                    <Button onClick={() => setTab("task")}>
                      Start Task
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60">
                  <div className="text-white/85 font-medium">Your task</div>
                  <div className="mt-1">
                    Log in to create a local session in your browser. Then go to the admin page and unlock the flag.
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* TASK TAB (unchanged except hint becomes a clearer hint section) */}
          {tab === "task" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Login + actions */}
              <Card className="p-6" hover={false}>
                <div className="text-xs tracking-[0.35em] text-white/55">TASK</div>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">Login & Try Admin</h3>
                <p className="mt-2 text-sm text-white/60">
                  Login creates a local session (stored in your browser). The admin page checks the role in that session.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4">
                  <div>
                    <div className="text-xs text-white/55 mb-2">Username</div>
                    <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
                  </div>

                  <div>
                    <div className="text-xs text-white/55 mb-2">Password</div>
                    <Input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="password"
                      type="password"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button onClick={login}>
                        <KeyRound className="h-4 w-4" />
                        Login & Get Session
                      </Button>
                    </motion.div>

                    <Button
                      variant="ghost"
                      onClick={() => navigate("/challenge/ch3/admin")}
                      disabled={!session}
                      className={!session ? "opacity-50" : ""}
                    >
                      Go to Admin Panel
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={clearLocalSession}
                      disabled={!sessionRaw}
                      className={!sessionRaw ? "opacity-50" : ""}
                    >
                      Clear Session
                    </Button>
                  </div>

                  {/* Hint section (only appears after 3 mins, same behavior as before) */}
                  {hintVisible && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                      <div className="text-white/85 font-medium">Hint</div>
                      <div className="mt-1">
                        This app reads your access level from something saved locally in your browser.
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Session Preview */}
              <Card className="p-6" hover={false}>
                <div className="text-xs tracking-[0.35em] text-white/55">SESSION (LOCAL)</div>
                <p className="mt-2 text-sm text-white/60">
                  The site stores your session under this key:
                  <span className="ml-2 font-mono text-white/80">{CH3_SESSION_KEY}</span>
                </p>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                  {!session ? (
                    <div className="text-sm text-white/55">No session yet. Login to generate one.</div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-white/55">role</div>
                        <div className="text-xs rounded-2xl px-3 py-1 border border-white/10 bg-white/5 text-white/70">
                          {String(session.role || "—")}
                        </div>
                      </div>

                      <div className="text-xs text-white/55">stored data</div>
                      <pre className="text-xs text-white/70 overflow-auto">
{JSON.stringify(session, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/challenge/ch3/admin")}
                    disabled={!session}
                    className={!session ? "opacity-50" : ""}
                  >
                    Go to Admin Panel
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* STATUS only if revealedFlag exists (unchanged) */}
          {showUnlockedStatus && (
            <Card className="p-6" hover={false}>
              <div className="text-xs tracking-[0.35em] text-white/55">STATUS</div>
              <div className="mt-2 text-sm text-white/70">
                Flag unlocked. Submit it from the dashboard to record score.
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/55">Unlocked flag</div>
                <div className="mt-2 font-mono text-sm text-white/85 break-all">
                  {progress.revealedFlag}
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}