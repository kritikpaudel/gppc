import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import BackgroundFX from "../components/layout/BackgroundFX";
import TopBar from "../components/layout/TopBar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

import { Shield, Info, KeyRound, ArrowRight, RotateCcw } from "lucide-react";

import { EVENT_TITLE, CHALLENGES } from "../data/challenges";
import { useCtfStore } from "../state/useCtfStore";
import { formatTime } from "../lib/time";
import { useActiveTimer } from "../hooks/useActiveTimer";

export const CH3_SESSION_KEY = "mini_ctf_ch3_session_v1";
// Keep flag in ONE place (admin unlock writes revealedFlag into store)
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

export default function Challenge3({ solved = false, onBack, onRetakeChallenge }) {
  const navigate = useNavigate();
  const { state, setState, totals } = useCtfStore();

  const ch3Meta = CHALLENGES.find((c) => c.id === "ch3");
  const progress = state.challenges?.ch3;

  // ✅ Timer (same behavior as your other challenges)
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

  const totalTime = formatTime(Math.floor((totals.totalTimeMs || 0) / 1000));

  // Hint unlock after 120 seconds spent in CH3 pages
  const seconds = Math.floor(((progress?.timeMs || 0) / 1000));
  const hintVisible = seconds >= 120;

  const [tab, setTab] = useState("info"); // info | task
  const [username, setUsername] = useState(state.fullName?.trim() ? state.fullName.trim() : "");
  const [password, setPassword] = useState("");

  // Keep a local copy of sessionRaw so UI updates instantly
  const [sessionRaw, setSessionRaw] = useState("");

  // Load session on mount + keep username synced with full name
  useEffect(() => {
    setSessionRaw(readSessionRaw());
  }, []);

  useEffect(() => {
    if (state.fullName?.trim()) setUsername(state.fullName.trim());
  }, [state.fullName]);

  // Optional: refresh session when tab changes (nice for UX)
  useEffect(() => {
    setSessionRaw(readSessionRaw());
  }, [tab]);

  const session = useMemo(() => safeParse(sessionRaw), [sessionRaw]);

  const login = () => {
    const newSession = {
      username: (username || "user").trim() || "user",
      // Always creates a normal user session from UI
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

  // ✅ Fix: do NOT show flag unless it was actually unlocked by admin page.
  const showUnlockedStatus =
    (progress?.status === "unlocked" || progress?.status === "submitted") &&
    !!progress?.revealedFlag;

  return (
    <div className="min-h-screen text-white">
      <BackgroundFX />
      <TopBar title={EVENT_TITLE} fullName={state.fullName} points={totals.totalPoints} time={totalTime} />

      <main className="mx-auto max-w-5xl px-5 pb-20 pt-10">
        <div className="space-y-6">
          {/* Header Card */}
          <Card className="p-6" hover={false}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs tracking-[0.35em] text-white/55">CHALLENGE 03</div>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  Client Trust — Role Based Access
                </h2>
                <p className="mt-3 text-white/60 text-sm leading-relaxed">
                  First read the basics (simple words). Then do the task. This challenge is about how
                  websites decide who is a normal user and who is an admin.
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

              <Button variant="ghost" onClick={onBack}>
                Back
              </Button>

              <Button variant="ghost" onClick={onRetakeChallenge}>
                <RotateCcw className="h-4 w-4" />
                Retake
              </Button>
            </div>
          </Card>

          {/* INFO TAB */}
          {tab === "info" && (
            <Card className="p-6" hover={false}>
              <div className="text-xs tracking-[0.35em] text-white/55">BASICS</div>

              <div className="mt-4 space-y-4 text-sm text-white/70 leading-relaxed">
                <div>
                  <div className="text-white/90 font-medium">1) Role</div>
                  <div className="mt-1 text-white/60">
                    A <span className="text-white/80">role</span> is a label that decides what you’re allowed
                    to access. Example: a normal “user” can browse pages, but an “admin” can see restricted areas.
                  </div>
                </div>

                <div>
                  <div className="text-white/90 font-medium">2) Access Check</div>
                  <div className="mt-1 text-white/60">
                    Some pages check your role before letting you in. If you don’t have the right role, the page
                    blocks you.
                  </div>
                </div>

                <div>
                  <div className="text-white/90 font-medium">3) Client vs Server</div>
                  <div className="mt-1 text-white/60">
                    <span className="text-white/80">Client-side</span> means your browser decides.
                    <br />
                    <span className="text-white/80">Server-side</span> means the website’s server decides.
                    <br />
                    If a website trusts the browser too much for security decisions, it can be risky.
                  </div>
                </div>

                <div>
                  <div className="text-white/90 font-medium">4) Timer & Score</div>
                  <div className="mt-1 text-white/60">
                    Your timer runs while you’re working in the challenge pages. Points reduce mainly based on time,
                    and retakes (if you retake).
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60">
                  <div className="text-white/85 font-medium">Your task</div>
                  <div className="mt-1">
                    Log in to get a local “session” saved in your browser. Then try to access the admin panel and
                    unlock the flag.
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setTab("task")}>
                  Start Task
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* TASK TAB */}
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

                  {hintVisible && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                      <div className="text-white/85 font-medium">System Note</div>
                      <div className="mt-1">
                        This app reads your access level from something saved locally in your browser.
                        If the browser stores it, the browser can also change it.
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

                      <div className="text-xs text-white/40">
                        Tip: this is only a preview. The admin page decides access using the stored role.
                      </div>
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

          {/* ✅ STATUS (only if unlocked AND revealedFlag exists) */}
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