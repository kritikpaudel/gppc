import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { motion } from "framer-motion";
import { UserRound, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Challenge2({ status = "unsolved", onBack, onRetakeChallenge }) {
  const navigate = useNavigate();

  const unlocked = status === "unlocked";
  const submitted = status === "submitted";

  return (
    <div className="space-y-6">
      <Card className="p-6" hover={false}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs tracking-[0.35em] text-white/55">SCENARIO</div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              Employee Portal — Public Profiles
            </h2>
            <p className="mt-3 text-white/60 text-sm leading-relaxed">
              You’re reviewing a new employee portal that lets users browse public profiles.
              Your goal is to locate the required information from the profiles and submit the final flag.
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
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button onClick={() => navigate("/challenge/ch2/profile?id=1")}>
              <UserRound className="h-4 w-4" />
              View Profile
            </Button>
          </motion.div>

          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>

          <Button variant="ghost" onClick={onRetakeChallenge}>
            <RotateCcw className="h-4 w-4" />
            Retake (-10%)
          </Button>
        </div>

        <div className="mt-4 text-xs text-white/40">
          Profiles are available for multiple employees.
        </div>
      </Card>

      <Card className="p-6" hover={false}>
        <div className="text-xs tracking-[0.35em] text-white/55">SUBMISSION</div>
        <div className="mt-2 text-sm text-white/60">
          Submit the correct flag from the dashboard.
        </div>
      </Card>
    </div>
  );
}
