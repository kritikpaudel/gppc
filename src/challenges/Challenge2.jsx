import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Info, UserRound, RotateCcw, ArrowRight, Lightbulb, Sparkles, Shuffle } from "lucide-react";
import { useCtfStore } from "../state/useCtfStore";
import { CHALLENGES } from "../data/challenges";

export default function Challenge2({ status = "unsolved", onBack, onRetakeChallenge }) {
  const navigate = useNavigate();
  const { state } = useCtfStore();

  const [tab, setTab] = useState("info"); // info | task

  const unlocked = status === "unlocked";
  const submitted = status === "submitted";

  const ch2Meta = useMemo(() => CHALLENGES.find((c) => c.id === "ch2"), []);
  const progress = state.challenges?.ch2 || {};
  const chSeconds = Math.floor((progress.timeMs || 0) / 1000);

  // ✅ Hint unlock after 3 mins
  const hintUnlocked = chSeconds >= 180;

  // Small “interactive” helper: jump to a random profile ID (still starts at 1 by default in Task)
  const goRandomProfile = () => {
    const id = Math.floor(Math.random() * 12) + 1;
    navigate(`/challenge/ch2/profile?id=${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Scenario / Status / Tabs */}
      <Card className="p-6" hover={false}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs tracking-[0.35em] text-white/55">SCENARIO</div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              Employee Portal — Public Profiles
            </h2>
            <p className="mt-3 text-white/60 text-sm leading-relaxed">
              You’re checking a new employee portal that shows public profiles. Somewhere inside one profile,
              there’s a hidden flag. Find it and submit it from the dashboard.
            </p>
          </div>

          {submitted ? (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200">
              Submitted
            </div>
          ) : unlocked ? (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-200">
              Flag Unlocked
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button variant={tab === "info" ? "primary" : "ghost"} onClick={() => setTab("info")}>
            <Info className="h-4 w-4" />
            Basics
          </Button>

          <Button variant={tab === "task" ? "primary" : "ghost"} onClick={() => setTab("task")}>
            <ArrowRight className="h-4 w-4" />
            Task
          </Button>

          <div className="flex-1" />

          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>

          <Button variant="ghost" onClick={onRetakeChallenge}>
            <RotateCcw className="h-4 w-4" />
            Retake (-10%)
          </Button>
        </div>
      </Card>

      {/* ✅ FUN, KID-FRIENDLY BASICS */}
      {tab === "info" && (
        <Card className="p-6" hover={false}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs tracking-[0.35em] text-white/55">BASICS</div>
              <div className="mt-2 text-sm text-white/60">
                Let’s learn like a game — quick stories, easy words, and tiny “try it” moments.
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
              <Sparkles className="h-4 w-4" />
              Kid Mode
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1 */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold text-white/90">🎭 What is a “Profile”?</div>
              <div className="mt-2 text-sm text-white/60 leading-relaxed">
                Imagine a <span className="text-white/80">player card</span> in a game.
                It shows a person’s name, picture, and a short message about them.
              </div>
              <div className="mt-3 text-xs text-white/45">
                Example: “Kai — loves animation — lives in Tokyo”
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold text-white/90">🔢 What is an “ID”?</div>
              <div className="mt-2 text-sm text-white/60 leading-relaxed">
                An ID is like a <span className="text-white/80">jersey number</span>.
                Player #1, Player #2, Player #3…
              </div>
              <div className="mt-3 text-xs text-white/45">
                If you change the number, you might see a different person.
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold text-white/90">🗺️ Real-world story</div>
              <div className="mt-2 text-sm text-white/60 leading-relaxed">
                You’re at a library. Each book has a number. If you ask for “Book #8” you get a different book
                than “Book #2”.
              </div>
              <div className="mt-3 text-xs text-white/45">
                Websites can work the same way with profile numbers.
              </div>
            </div>

            {/* Card 4 */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold text-white/90">🕵️ Your mission (super simple)</div>
              <div className="mt-2 text-sm text-white/60 leading-relaxed">
                Open the profile viewer. Look around the profile page carefully.
                One profile contains a secret flag.
              </div>
              <div className="mt-3 text-xs text-white/45">
                You don’t submit here — you submit from the dashboard.
              </div>
            </div>
          </div>

          {/* Tiny interactive “Try it” row */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold text-white/90">🎮 Mini “Try it”</div>
            <div className="mt-2 text-sm text-white/60">
              Want a quick start? Jump to a random profile and explore like a detective.
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button onClick={() => setTab("task")}>
                  Start Task
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>

              <Button variant="ghost" onClick={goRandomProfile}>
                <Shuffle className="h-4 w-4" />
                Random Profile
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* TASK TAB */}
      {tab === "task" && (
        <Card className="p-6" hover={false}>
          <div className="text-xs tracking-[0.35em] text-white/55">TASK</div>
          <div className="mt-2 text-sm text-white/60">
            Browse employee profiles using the profile viewer.
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button onClick={() => navigate("/challenge/ch2/profile?id=1")}>
                <UserRound className="h-4 w-4" />
                View Profile
              </Button>
            </motion.div>

            <Button variant="ghost" onClick={goRandomProfile}>
              <Shuffle className="h-4 w-4" />
              Random Profile
            </Button>
          </div>

          <div className="mt-4 text-xs text-white/40">
            Profiles are available for multiple employees.
          </div>
        </Card>
      )}

      {/* ✅ HINTS CARD (always visible, no highlighted “extra content”) */}
      <Card className="p-6" hover={false}>
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs tracking-[0.35em] text-white/55">HINTS</div>

          <div
            className={[
              "inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs border",
              hintUnlocked
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                : "border-white/10 bg-white/5 text-white/70",
            ].join(" ")}
          >
            <Lightbulb className="h-4 w-4" />
            {hintUnlocked ? "Unlocked" : "Locked"}
          </div>
        </div>

        {!hintUnlocked ? (
          <div className="mt-3 text-sm text-white/60">
            Hint unlocks at <span className="text-white/80 font-medium">3:00</span> challenge time.
          </div>
        ) : (
          <div className="mt-3 text-sm text-white/60 leading-relaxed">
            Some pages choose what to show using a number in the URL (like an ID). Changing the number can change
            the profile you see.
          </div>
        )}
      </Card>

      {/* Submission */}
      <Card className="p-6" hover={false}>
        <div className="text-xs tracking-[0.35em] text-white/55">SUBMISSION</div>
        <div className="mt-2 text-sm text-white/60">
          Submit the correct flag from the dashboard.
        </div>
      </Card>
    </div>
  );
}