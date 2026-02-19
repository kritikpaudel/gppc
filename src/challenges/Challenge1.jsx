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
// ✅ Pure JS MD5 (works in all browsers)
function md5Hex(str) {
  function cmn(q, a, b, x, s, t) {
    a = (a + q + x + t) | 0;
    return (((a << s) | (a >>> (32 - s))) + b) | 0;
  }
  function ff(a, b, c, d, x, s, t) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a, b, c, d, x, s, t) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a, b, c, d, x, s, t) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a, b, c, d, x, s, t) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  function md5cycle(state, block) {
    let [a, b, c, d] = state;

    a = ff(a, b, c, d, block[0], 7, -680876936);
    d = ff(d, a, b, c, block[1], 12, -389564586);
    c = ff(c, d, a, b, block[2], 17, 606105819);
    b = ff(b, c, d, a, block[3], 22, -1044525330);
    a = ff(a, b, c, d, block[4], 7, -176418897);
    d = ff(d, a, b, c, block[5], 12, 1200080426);
    c = ff(c, d, a, b, block[6], 17, -1473231341);
    b = ff(b, c, d, a, block[7], 22, -45705983);
    a = ff(a, b, c, d, block[8], 7, 1770035416);
    d = ff(d, a, b, c, block[9], 12, -1958414417);
    c = ff(c, d, a, b, block[10], 17, -42063);
    b = ff(b, c, d, a, block[11], 22, -1990404162);
    a = ff(a, b, c, d, block[12], 7, 1804603682);
    d = ff(d, a, b, c, block[13], 12, -40341101);
    c = ff(c, d, a, b, block[14], 17, -1502002290);
    b = ff(b, c, d, a, block[15], 22, 1236535329);

    a = gg(a, b, c, d, block[1], 5, -165796510);
    d = gg(d, a, b, c, block[6], 9, -1069501632);
    c = gg(c, d, a, b, block[11], 14, 643717713);
    b = gg(b, c, d, a, block[0], 20, -373897302);
    a = gg(a, b, c, d, block[5], 5, -701558691);
    d = gg(d, a, b, c, block[10], 9, 38016083);
    c = gg(c, d, a, b, block[15], 14, -660478335);
    b = gg(b, c, d, a, block[4], 20, -405537848);
    a = gg(a, b, c, d, block[9], 5, 568446438);
    d = gg(d, a, b, c, block[14], 9, -1019803690);
    c = gg(c, d, a, b, block[3], 14, -187363961);
    b = gg(b, c, d, a, block[8], 20, 1163531501);
    a = gg(a, b, c, d, block[13], 5, -1444681467);
    d = gg(d, a, b, c, block[2], 9, -51403784);
    c = gg(c, d, a, b, block[7], 14, 1735328473);
    b = gg(b, c, d, a, block[12], 20, -1926607734);

    a = hh(a, b, c, d, block[5], 4, -378558);
    d = hh(d, a, b, c, block[8], 11, -2022574463);
    c = hh(c, d, a, b, block[11], 16, 1839030562);
    b = hh(b, c, d, a, block[14], 23, -35309556);
    a = hh(a, b, c, d, block[1], 4, -1530992060);
    d = hh(d, a, b, c, block[4], 11, 1272893353);
    c = hh(c, d, a, b, block[7], 16, -155497632);
    b = hh(b, c, d, a, block[10], 23, -1094730640);
    a = hh(a, b, c, d, block[13], 4, 681279174);
    d = hh(d, a, b, c, block[0], 11, -358537222);
    c = hh(c, d, a, b, block[3], 16, -722521979);
    b = hh(b, c, d, a, block[6], 23, 76029189);
    a = hh(a, b, c, d, block[9], 4, -640364487);
    d = hh(d, a, b, c, block[12], 11, -421815835);
    c = hh(c, d, a, b, block[15], 16, 530742520);
    b = hh(b, c, d, a, block[2], 23, -995338651);

    a = ii(a, b, c, d, block[0], 6, -198630844);
    d = ii(d, a, b, c, block[7], 10, 1126891415);
    c = ii(c, d, a, b, block[14], 15, -1416354905);
    b = ii(b, c, d, a, block[5], 21, -57434055);
    a = ii(a, b, c, d, block[12], 6, 1700485571);
    d = ii(d, a, b, c, block[3], 10, -1894986606);
    c = ii(c, d, a, b, block[10], 15, -1051523);
    b = ii(b, c, d, a, block[1], 21, -2054922799);
    a = ii(a, b, c, d, block[8], 6, 1873313359);
    d = ii(d, a, b, c, block[15], 10, -30611744);
    c = ii(c, d, a, b, block[6], 15, -1560198380);
    b = ii(b, c, d, a, block[13], 21, 1309151649);
    a = ii(a, b, c, d, block[4], 6, -145523070);
    d = ii(d, a, b, c, block[11], 10, -1120210379);
    c = ii(c, d, a, b, block[2], 15, 718787259);
    b = ii(b, c, d, a, block[9], 21, -343485551);

    state[0] = (state[0] + a) | 0;
    state[1] = (state[1] + b) | 0;
    state[2] = (state[2] + c) | 0;
    state[3] = (state[3] + d) | 0;
  }

  function md5blk(s) {
    const blocks = [];
    for (let i = 0; i < 64; i += 4) {
      blocks[i >> 2] =
        s.charCodeAt(i) +
        (s.charCodeAt(i + 1) << 8) +
        (s.charCodeAt(i + 2) << 16) +
        (s.charCodeAt(i + 3) << 24);
    }
    return blocks;
  }

  function md51(s) {
    const n = s.length;
    const state = [1732584193, -271733879, -1732584194, 271733878];
    let i;
    for (i = 64; i <= n; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);

    const tail = new Array(16).fill(0);
    for (i = 0; i < s.length; i++) tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) {
      md5cycle(state, tail);
      for (i = 0; i < 16; i++) tail[i] = 0;
    }
    tail[14] = n * 8;
    md5cycle(state, tail);

    return state;
  }

  function rhex(n) {
    let s = "";
    for (let j = 0; j < 4; j++) s += ("0" + ((n >> (j * 8)) & 0xff).toString(16)).slice(-2);
    return s;
  }

  function hex(x) {
    return x.map(rhex).join("");
  }

  return hex(md51(str));
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

const doGenerate = () => {
  const out = md5Hex(plain);
  setGenerated(out);
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
