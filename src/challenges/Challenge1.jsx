import { useMemo, useState } from "react";
import md5 from "blueimp-md5";
import { motion } from "framer-motion";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Copy, CheckCircle2, ShieldAlert, RotateCcw, ArrowLeft } from "lucide-react";

const FLAG = "flag{triple_md5_master}";

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

function Field({ k, v }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 py-2 text-sm">
      <div className="text-white/55">{k}</div>
      <div className="text-white/85 font-medium text-right">{v}</div>
    </div>
  );
}

function normalizeHash(v) {
  return (v || "").trim().toLowerCase();
}

function isLikelyMd5(v) {
  const s = normalizeHash(v);
  return /^[a-f0-9]{32}$/.test(s);
}

export default function Challenge1({
  onSolved,
  onWrongAttempt,
  solved = false,
  attempts = 0,
  onBack,
  onRetakeChallenge, // ✅ new (reset progress)
}) {
  const [md5Input, setMd5Input] = useState("");
  const md5Output = useMemo(() => (md5Input ? md5(md5Input) : ""), [md5Input]);

  const [answers, setAnswers] = useState({ p1: "", p2: "", p3: "" });

  const [toast, setToast] = useState({ ok: false, msg: "" });
  const [fieldState, setFieldState] = useState({
    tried: false,
    wrong: { p1: false, p2: false, p3: false },
    shake: { p1: 0, p2: 0, p3: 0 },
  });

  const showToast = (ok, msg) => {
    setToast({ ok, msg });
    if (msg) setTimeout(() => setToast({ ok: false, msg: "" }), 1400);
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(true, "Copied!");
    } catch {
      showToast(false, "Copy blocked by browser.");
    }
  };

  const clearInputsNoPenalty = () => {
    setAnswers({ p1: "", p2: "", p3: "" });
    setFieldState((s) => ({
      ...s,
      tried: false,
      wrong: { p1: false, p2: false, p3: false },
    }));
  };

  // Penalty retake (while unsolved)
  const retakeAttempt = () => {
    if (solved) return;
    onWrongAttempt?.();
    clearInputsNoPenalty();
    showToast(false, "Retake used.");
  };

  const submit = () => {
    if (solved) return;

    const a1 = normalizeHash(answers.p1);
    const a2 = normalizeHash(answers.p2);
    const a3 = normalizeHash(answers.p3);

    const f1 = isLikelyMd5(a1);
    const f2 = isLikelyMd5(a2);
    const f3 = isLikelyMd5(a3);

    if (!f1 || !f2 || !f3) {
      setFieldState((s) => ({
        tried: true,
        wrong: { p1: !f1, p2: !f2, p3: !f3 },
        shake: {
          p1: s.shake.p1 + (!f1 ? 1 : 0),
          p2: s.shake.p2 + (!f2 ? 1 : 0),
          p3: s.shake.p3 + (!f3 ? 1 : 0),
        },
      }));
      showToast(false, "Invalid format. Submit 32-char MD5 values.");
      return;
    }

    const ok1 = a1 === EXPECTED.p1;
    const ok2 = a2 === EXPECTED.p2;
    const ok3 = a3 === EXPECTED.p3;

    if (!(ok1 && ok2 && ok3)) {
      onWrongAttempt?.();
      setFieldState((s) => ({
        tried: true,
        wrong: { p1: !ok1, p2: !ok2, p3: !ok3 },
        shake: {
          p1: s.shake.p1 + (!ok1 ? 1 : 0),
          p2: s.shake.p2 + (!ok2 ? 1 : 0),
          p3: s.shake.p3 + (!ok3 ? 1 : 0),
        },
      }));
      showToast(false, "Incorrect. One or more hashes do not match.");
      return;
    }

    showToast(true, "Correct! Flag unlocked.");
    onSolved?.(FLAG);
  };

  const inputClass = (key) => {
    const bad = fieldState.tried && fieldState.wrong[key];
    return ["font-mono", bad ? "border-rose-400/40 ring-2 ring-rose-400/10" : ""].join(" ");
  };

  return (
    <div className="space-y-6">
      <Card className="p-6" hover={false}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs tracking-[0.35em] text-white/55">SCENARIO</div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              Password Cracking (MD5) — 3 Profiles
            </h2>
            <p className="mt-3 text-white/60 text-sm leading-relaxed">
              You’re auditing weak password practices. Each profile uses a predictable password pattern
              based on personal details. Generate the password, convert it to MD5, and submit the MD5
              hash for all three profiles to unlock the final flag.
            </p>
          </div>

          {solved ? (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              Solved
            </div>
          ) : (
            <div className="text-xs text-white/45 text-right">
              Wrong attempts: <span className="text-white/70 font-medium">{attempts}</span>
            </div>
          )}
        </div>

        {/* ✅ If solved, still offer RETAKE CHALLENGE (reset for new team) */}
        {solved && (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm text-white/70">
              Challenge is locked because it’s solved. You can retake to reset progress on this device.
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button onClick={onRetakeChallenge}>
                <RotateCcw className="h-4 w-4" />
                Retake Challenge
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PROFILES.map((p) => (
          <Card key={p.key} className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold tracking-tight">{p.label}</div>
              <div className="text-xs text-white/55">User</div>
            </div>

            <div className="mt-4">
              <Field k="Name" v={p.name} />
              <Field k="Spouse Name" v={p.spouseName} />
              <Field k="Age" v={p.age} />
              <Field k="DOB" v={p.dob} />
              <Field k="Email" v={p.email} />
              <Field k="Company" v={p.company} />
              <Field k="Designation" v={p.designation} />
              <Field k="Pet Name(s)" v={p.pets.join(", ")} />
              <Field k="City" v={p.city} />
            </div>
          </Card>
        ))}
      </div>

      {/* MD5 Generator */}
      <Card className="p-6" hover={false}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs tracking-[0.35em] text-white/55">MD5 GENERATOR</div>
            <div className="mt-2 text-sm text-white/60">
              Enter your guessed password and generate its MD5 hash.
            </div>
          </div>

          {toast.msg && (
            <div
              className={[
                "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs",
                toast.ok
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                  : "border-rose-400/20 bg-rose-400/10 text-rose-200",
              ].join(" ")}
            >
              {toast.ok ? <CheckCircle2 className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
              {toast.msg}
            </div>
          )}
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
          <div>
            <div className="text-xs text-white/55 mb-2">Password guess</div>
            <Input
              value={md5Input}
              onChange={(e) => setMd5Input(e.target.value)}
              placeholder="Type password guess…"
              className="font-mono"
            />
          </div>
          <Button variant="ghost" onClick={() => setMd5Input("")}>
            Clear
          </Button>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/55">MD5 Output</div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="font-mono text-sm text-white/85 break-all">
              {md5Output || "—"}
            </div>
            <Button
              variant="ghost"
              onClick={() => md5Output && copy(md5Output)}
              disabled={!md5Output}
              className={!md5Output ? "opacity-50" : ""}
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>
        </div>
      </Card>

      {/* Submission */}
      <Card className="p-6" hover={false}>
        <div className="text-xs tracking-[0.35em] text-white/55">SUBMISSION</div>
        <div className="mt-2 text-sm text-white/60">
          Submit the MD5 hash for each profile.
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          {["p1", "p2", "p3"].map((k) => (
            <motion.div
              key={`${k}-${fieldState.shake[k]}`}
              animate={fieldState.tried && fieldState.wrong[k] ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Input
                value={answers[k]}
                onChange={(e) => setAnswers((s) => ({ ...s, [k]: e.target.value }))}
                placeholder={`Profile 0${k === "p1" ? "1" : k === "p2" ? "2" : "3"} MD5`}
                className={inputClass(k)}
                disabled={solved}
              />
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between gap-3">
          {!solved ? (
            <>
              <Button variant="ghost" onClick={retakeAttempt} title="Counts as a wrong attempt and clears inputs.">
                <RotateCcw className="h-4 w-4" />
                Retake Attempt
              </Button>

              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={clearInputsNoPenalty}>
                  Clear Inputs
                </Button>
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button onClick={submit}>Submit All</Button>
                </motion.div>
              </div>
            </>
          ) : (
            <div className="ml-auto text-xs text-white/50">
              Retake available above (Retake Challenge).
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
