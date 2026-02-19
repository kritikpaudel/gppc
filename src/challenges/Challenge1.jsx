import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { ArrowRight, CheckCircle2, XCircle, Info, RotateCcw, ArrowLeft } from "lucide-react";
import { useCtfStore } from "../state/useCtfStore";

const FLAG = "FL@G{Woohoo_C0ng0_U_D!d_It}";

const EXPECTED = {
  p1: "764b4f6bf8efe47b3ec2202f5c3cfa83",
  p2: "470b0efc4335b938ed36c8ce984b6dee",
  p3: "2e138fe57b2d9b3b958b66ba486c6c42",
};

const PROFILES = [
  {
    key: "p1",
    label: "Profile 01",
    name: "John Doe",
    spouseName: "Jeffry Doe",
    age: 29,
    dob: "1996-09-11",
    email: "john.doe@oakridge-mail.com",
    company: "Oakridge Systems",
    designation: "Operations Associate",
    pets: ["Milo"],
    city: "Austin",
  },
  {
    key: "p2",
    label: "Profile 02",
    name: "Aisha Khan",
    spouseName: "Omar Khan",
    age: 34,
    dob: "1991-04-22",
    email: "aisha.khan@brightpeak.io",
    company: "BrightPeak Labs",
    designation: "HR Manager",
    pets: ["Nala", "Kiko"],
    city: "Dubai",
  },
  {
    key: "p3",
    label: "Profile 03",
    name: "Ravi Menon",
    spouseName: "Meera Menon",
    age: 26,
    dob: "1999-01-18",
    email: "ravi.menon@northwave.co",
    company: "NorthWave Co.",
    designation: "Junior Analyst",
    pets: ["Snowy"],
    city: "Bengaluru",
  },
];

// Browser MD5
async function md5Hex(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("MD5", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function Badge({ ok, children }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-2xl border px-3 py-1 text-xs",
        ok
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
          : "border-white/10 bg-white/5 text-white/70",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export default function Challenge1({ status = "unsolved", retakes = 0, onUnlocked, onBack, onRetakeChallenge }) {
  const solvedHere = status !== "unsolved"; // unlocked/submitted
  const { state } = useCtfStore();
  const timeMs = state?.challenges?.ch1?.timeMs || 0;
  const hintsUnlocked = timeMs >= 2 * 60 * 1000;

  const [plain, setPlain] = useState("");
  const [generated, setGenerated] = useState("");
  const [genLoading, setGenLoading] = useState(false);

  const [answers, setAnswers] = useState({ p1: "", p2: "", p3: "" });
  const [check, setCheck] = useState(null);

  const [toast, setToast] = useState({ open: false, ok: false, msg: "" });
  const showToast = (ok, msg) => {
    setToast({ open: true, ok, msg });
    setTimeout(() => setToast({ open: false, ok: false, msg: "" }), 1600);
  };

  const normalized = (s) => (s || "").trim().toLowerCase();

  const doGenerate = async () => {
    setGenLoading(true);
    try {
      const out = await md5Hex(plain);
      setGenerated(out);
    } finally {
      setGenLoading(false);
    }
  };

  const validateAll = () => {
    const r = {
      p1: normalized(answers.p1) === EXPECTED.p1,
      p2: normalized(answers.p2) === EXPECTED.p2,
      p3: normalized(answers.p3) === EXPECTED.p3,
    };
    setCheck(r);

    const wrongKeys = Object.entries(r)
      .filter(([, ok]) => !ok)
      .map(([k]) => k);

    if (wrongKeys.length === 0) {
      onUnlocked?.(FLAG);
      showToast(true, "All profiles verified. Flag unlocked!");
      return;
    }

    const labelMap = { p1: "Profile 1", p2: "Profile 2", p3: "Profile 3" };
    if (wrongKeys.length === 1) showToast(false, `${labelMap[wrongKeys[0]]} is incorrect.`);
    else showToast(false, `${wrongKeys.map((k) => labelMap[k]).join(", ")} are incorrect.`);
  };

  const statusLine = useMemo(() => {
    if (!check) return null;
    const okCount = Object.values(check).filter(Boolean).length;
    return `${okCount}/3 correct`;
  }, [check]);

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast.open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={[
              "fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-2xl border px-4 py-2 text-xs backdrop-blur",
              toast.ok
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                : "border-rose-400/20 bg-rose-400/10 text-rose-200",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              {toast.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {toast.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="p-6" hover={false}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xs tracking-[0.35em] text-white/55">SCENARIO</div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">Credential Guess + MD5</h2>
            <p className="mt-3 text-white/60 text-sm leading-relaxed max-w-3xl">
              Derive a password for each profile, generate its MD5, and verify all three.
              After unlocking the flag, submit it on the dashboard to record your score.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge ok={false}>Retakes: <span className="text-white/85 font-medium">{retakes}</span></Badge>
              {statusLine ? <Badge ok={false}>{statusLine}</Badge> : null}
              {status === "unlocked" ? <Badge ok={true}>Flag Unlocked</Badge> : null}
              {status === "submitted" ? <Badge ok={true}>Submitted</Badge> : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button variant="ghost" onClick={onRetakeChallenge}>
              <RotateCcw className="h-4 w-4" />
              Retake (-10%)
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {PROFILES.map((p) => {
          const ok = check ? !!check[p.key] : null;

          return (
            <Card key={p.key} className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs tracking-[0.35em] text-white/55">{p.label}</div>
                  <div className="mt-2 text-lg font-semibold tracking-tight">{p.name}</div>
                  <div className="mt-1 text-xs text-white/55">{p.designation}</div>
                </div>

                {ok === null ? null : ok ? (
                  <span className="inline-flex items-center gap-1 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Correct
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs text-rose-200">
                    <XCircle className="h-3.5 w-3.5" />
                    Incorrect
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2 text-sm text-white/65">
                <div><span className="text-white/45">Spouse:</span> <span className="text-white/80">{p.spouseName}</span></div>
                <div><span className="text-white/45">Age:</span> <span className="text-white/80">{p.age}</span></div>
                <div><span className="text-white/45">DOB:</span> <span className="text-white/80">{p.dob}</span></div>
                <div><span className="text-white/45">Email:</span> <span className="text-white/80">{p.email}</span></div>
                <div><span className="text-white/45">Company:</span> <span className="text-white/80">{p.company}</span></div>
                <div><span className="text-white/45">Pets:</span> <span className="text-white/80">{p.pets.join(", ")}</span></div>
                <div><span className="text-white/45">City:</span> <span className="text-white/80">{p.city}</span></div>
              </div>

              <div className="mt-5">
                <div className="text-xs text-white/55 mb-2">MD5 (submit this)</div>
                <Input
                  className="font-mono"
                  placeholder="Paste MD5 here..."
                  value={answers[p.key]}
                  onChange={(e) => setAnswers((s) => ({ ...s, [p.key]: e.target.value }))}
                  disabled={solvedHere}
                />
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6" hover={false}>
        <div className="text-xs tracking-[0.35em] text-white/55">MD5 GENERATOR</div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
          <div>
            <div className="text-xs text-white/55 mb-2">Plain text</div>
            <Input
              className="font-mono"
              value={plain}
              onChange={(e) => setPlain(e.target.value)}
              placeholder="Type a password guess…"
            />
          </div>

          <Button onClick={doGenerate} disabled={genLoading || !plain.trim()}>
            Generate
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4">
          <div className="text-xs text-white/55 mb-2">MD5 output</div>
          <Input className="font-mono" value={generated} readOnly placeholder="MD5 will appear here…" />
          <div className="mt-2 text-[11px] text-white/40">
            Copy the MD5 output and paste it into the matching profile input above.
          </div>
        </div>
      </Card>

      <Card className="p-6" hover={false}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs tracking-[0.35em] text-white/55">NUDGES</div>
            <div className="mt-2 text-sm text-white/60">Subtle hints appear after 2 minutes.</div>
          </div>

          {hintsUnlocked ? (
            <span className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
              <Info className="h-4 w-4" />
              Unlocked
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              <Info className="h-4 w-4" />
              Locked (2:00)
            </span>
          )}
        </div>

        <AnimatePresence initial={false}>
          {hintsUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">
                <div className="text-xs text-white/50 mb-1">Profile 1</div>
                Relationship fields can be “ingredients”. Sometimes a symbol sits between word and number.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">
                <div className="text-xs text-white/50 mb-1">Profile 2</div>
                Some profiles have more than one pet. Not every date needs the full format.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">
                <div className="text-xs text-white/50 mb-1">Profile 3</div>
                Company names often start with a key word. Sometimes only the first part matters.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Card className="p-6" hover={false}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs tracking-[0.35em] text-white/55">VERIFY</div>
            <div className="mt-2 text-sm text-white/60">
              Verify all three MD5 values to unlock the flag (submission happens on dashboard).
            </div>
          </div>

          <Button onClick={validateAll} disabled={solvedHere}>
            Verify
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
