import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import BackgroundFX from "../components/layout/BackgroundFX";
import TopBar from "../components/layout/TopBar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useCtfStore } from "../state/useCtfStore";
import { formatTime } from "../lib/time";
import { EVENT_TITLE, CHALLENGES } from "../data/challenges";
import {
  Upload,
  ClipboardPaste,
  Trash2,
  Pencil,
  Save,
  X,
  Users,
  FileDown,
} from "lucide-react";

const STORAGE_KEY = "ctf_admin_users_v1";

function safeParse(jsonText) {
  try {
    return { ok: true, data: JSON.parse(jsonText) };
  } catch (e) {
    return { ok: false, error: e?.message || "Invalid JSON" };
  }
}

function normalizeImportedPayload(payload) {
  // Accept either a single export object or an array of them
  const items = Array.isArray(payload) ? payload : [payload];

  return items
    .map((p) => {
      if (!p || typeof p !== "object") return null;

      // Expected format:
      // { app, version, exportedAt, fullName, totals, challenges }
      const fullName = (p.fullName || "").trim();
      const totals = p.totals || {};
      const challenges = p.challenges || {};

      if (!fullName) return null;

      const id =
        p.userId ||
        `${fullName.toLowerCase()}__${String(p.exportedAt || Date.now())}`;

      return {
        id,
        fullName,
        exportedAt: p.exportedAt || new Date().toISOString(),
        totals: {
          totalPoints: Number(totals.totalPoints || 0),
          solvedCount: Number(totals.solvedCount || 0),
          totalTimeMs: Number(totals.totalTimeMs || 0),
        },
        challenges,
        raw: p,
      };
    })
    .filter(Boolean);
}

function loadUsers() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const parsed = safeParse(raw);
  if (!parsed.ok) return [];
  return Array.isArray(parsed.data) ? parsed.data : [];
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function statusPill(status) {
  const s = String(status || "unsolved");
  if (s === "submitted") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  if (s === "unlocked") return "border-cyan-400/20 bg-cyan-400/10 text-cyan-200";
  return "border-white/10 bg-white/5 text-white/70";
}

function toInt(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback;
}

function recomputeTotalsFromChallenges(challenges) {
  let totalPoints = 0;
  let solvedCount = 0;
  let totalTimeMs = 0;

  for (const key of Object.keys(challenges || {})) {
    const p = challenges[key] || {};
    totalTimeMs += toInt(p.timeMs, 0);

    if (String(p.status) === "submitted") {
      solvedCount += 1;
      totalPoints += toInt(p.pointsAwarded, 0);
    }
  }

  return { totalPoints, solvedCount, totalTimeMs };
}


export default function Admin() {
  const { state, totals } = useCtfStore();
  const totalTime = formatTime(Math.floor((totals?.totalTimeMs || 0) / 1000));

  const [users, setUsers] = useState(() => loadUsers());
  const [paste, setPaste] = useState("");
  const [msg, setMsg] = useState({ ok: false, text: "" });

  const [editingStatsId, setEditingStatsId] = useState(null);
  const [draftChallenges, setDraftChallenges] = useState(null);

  // simple inline edit
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const showMsg = (ok, text) => {
    setMsg({ ok, text });
    setTimeout(() => setMsg({ ok: false, text: "" }), 1800);
  };

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  const importJsonText = (text) => {
    const parsed = safeParse(text);
    if (!parsed.ok) {
      showMsg(false, `Import failed: ${parsed.error}`);
      return;
    }

    const normalized = normalizeImportedPayload(parsed.data);
    if (!normalized.length) {
      showMsg(false, "Import failed: no valid user record found.");
      return;
    }

    setUsers((prev) => {
      const map = new Map(prev.map((u) => [u.id, u]));

      for (const u of normalized) {
        // Upsert by id; if same fullName exists with different id, keep both
        map.set(u.id, u);
      }

      return Array.from(map.values()).sort(
        (a, b) => new Date(b.exportedAt).getTime() - new Date(a.exportedAt).getTime()
      );
    });

    showMsg(true, `Imported ${normalized.length} user(s).`);
    setPaste("");
  };

  const onFile = async (file) => {
    const text = await file.text();
    importJsonText(text);
  };

  const deleteUser = (id) => {
    const ok = window.confirm("Delete this user from admin list?");
    if (!ok) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const clearAll = () => {
    const ok = window.confirm("Clear ALL imported users?");
    if (!ok) return;
    setUsers([]);
    localStorage.removeItem(STORAGE_KEY);
    showMsg(true, "Cleared admin users.");
  };

  const startEdit = (u) => {
    setEditingId(u.id);
    setEditName(u.fullName);
  };

  const saveEdit = () => {
    const name = editName.trim();
    if (!name) {
      showMsg(false, "Name cannot be empty.");
      return;
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === editingId ? { ...u, fullName: name } : u))
    );
    setEditingId(null);
    setEditName("");
    showMsg(true, "Updated.");
  };
  const startEditStats = (u) => {
    setEditingStatsId(u.id);
    // deep clone so edits don't mutate original until save
    setDraftChallenges(JSON.parse(JSON.stringify(u.challenges || {})));
  };

  const cancelEditStats = () => {
    setEditingStatsId(null);
    setDraftChallenges(null);
  };

  const saveEditStats = (userId) => {
    if (!draftChallenges) return;

    // Normalize & sanitize
    const normalized = {};
    for (const k of Object.keys(draftChallenges)) {
      const p = draftChallenges[k] || {};
      normalized[k] = {
        ...p,
        status: ["unsolved", "unlocked", "submitted"].includes(String(p.status))
          ? String(p.status)
          : "unsolved",
        timeMs: toInt(p.timeMs, 0),
        attempts: toInt(p.attempts, 0),
        pointsAwarded: toInt(p.pointsAwarded, 0),
      };
    }

    const newTotals = recomputeTotalsFromChallenges(normalized);

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              challenges: normalized,
              totals: newTotals,
            }
          : u
      )
    );

    setEditingStatsId(null);
    setDraftChallenges(null);
    showMsg(true, "Updated challenge stats.");
  };


  const exportAll = () => {
    const payload = {
      app: "gppc-mini-ctf-admin",
      version: 1,
      exportedAt: new Date().toISOString(),
      users,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ctf-admin-users_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showMsg(true, "Exported admin users JSON.");
  };

  const summary = useMemo(() => {
    const totalTeams = users.length;
    const submittedTeams = users.filter((u) => Number(u?.totals?.solvedCount || 0) > 0).length;
    const topScore = users.reduce((m, u) => Math.max(m, Number(u?.totals?.totalPoints || 0)), 0);
    return { totalTeams, submittedTeams, topScore };
  }, [users]);

  return (
    <div className="min-h-screen text-white">
      <BackgroundFX />
      <TopBar title={EVENT_TITLE} fullName={state.fullName} points={totals.totalPoints} time={totalTime} />

      {/* toast */}
      {msg.text ? (
        <div
          className={[
            "fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-2xl border px-4 py-2 text-xs backdrop-blur",
            msg.ok
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
              : "border-rose-400/20 bg-rose-400/10 text-rose-200",
          ].join(" ")}
        >
          {msg.text}
        </div>
      ) : null}

      <main className="mx-auto max-w-6xl px-5 pb-20 pt-10 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <Card className="p-6" hover={false}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs tracking-[0.35em] text-white/55">ADMIN</div>
                <div className="mt-2 text-xl font-semibold tracking-tight flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Imported Players
                </div>
                <div className="mt-2 text-sm text-white/60">
                  Import exported JSON from participants’ devices. This admin view is local to your browser.
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={exportAll} disabled={!users.length}>
                  <FileDown className="h-4 w-4" />
                  Export All
                </Button>
                <Button variant="ghost" onClick={clearAll} disabled={!users.length}>
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/55">Teams Imported</div>
                <div className="text-2xl font-semibold mt-1">{summary.totalTeams}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/55">Teams With Submissions</div>
                <div className="text-2xl font-semibold mt-1">{summary.submittedTeams}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/55">Top Score</div>
                <div className="text-2xl font-semibold mt-1">{summary.topScore}</div>
              </div>
            </div>
          </Card>

          {/* Import */}
          <Card className="p-6" hover={false}>
            <div className="text-xs tracking-[0.35em] text-white/55">IMPORT</div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-end">
              <div>
                <div className="text-xs text-white/55 mb-2">Paste exported JSON</div>
                <Input
                  value={paste}
                  onChange={(e) => setPaste(e.target.value)}
                  placeholder='Paste the exported JSON here (starts with {"app":"gppc-mini-ctf"...})'
                  className="font-mono"
                />
              </div>

              <Button
                onClick={() => importJsonText(paste)}
                disabled={!paste.trim()}
                className={!paste.trim() ? "opacity-50" : ""}
              >
                <ClipboardPaste className="h-4 w-4" />
                Import
              </Button>

              <label className="inline-flex">
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onFile(f);
                    e.target.value = "";
                  }}
                />
                <Button variant="ghost">
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </label>
            </div>

            <div className="mt-3 text-[11px] text-white/40">
              Tip: Participants can click “Export JSON” on their dashboard and send you the file.
            </div>
          </Card>

          {/* Users table */}
          <Card className="p-6" hover={false}>
            <div className="text-xs tracking-[0.35em] text-white/55">USERS</div>

            {!users.length ? (
              <div className="mt-4 text-sm text-white/60">
                No imported users yet.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {users.map((u) => (
                  <div key={u.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {editingId === u.id ? (
                            <>
                              <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="max-w-xs"
                              />
                              <Button variant="ghost" onClick={saveEdit}>
                                <Save className="h-4 w-4" />
                                Save
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setEditingId(null);
                                  setEditName("");
                                }}
                              >
                                <X className="h-4 w-4" />
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <div className="text-lg font-semibold tracking-tight truncate">
                                {u.fullName}
                              </div>
                              <Button variant="ghost" onClick={() => startEdit(u)}>
                                <Pencil className="h-4 w-4" />
                                Edit
                              </Button>
                            </>
                          )}
                        </div>

                        <div className="mt-1 text-xs text-white/45">
                          Exported: {new Date(u.exportedAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs text-white/55">Points</div>
                          <div className="text-xl font-semibold">
                            {Number(u?.totals?.totalPoints || 0)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-white/55">Solved</div>
                          <div className="text-xl font-semibold">
                            {Number(u?.totals?.solvedCount || 0)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-white/55">Time</div>
                          <div className="text-xl font-semibold">
                            {formatTime(Math.floor(Number(u?.totals?.totalTimeMs || 0) / 1000))}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => startEditStats(u)}
                          disabled={editingStatsId && editingStatsId !== u.id}
                          className={editingStatsId && editingStatsId !== u.id ? "opacity-50" : ""}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit Stats
                        </Button>

                        <Button variant="ghost" onClick={() => deleteUser(u.id)}>
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4">
                      {editingStatsId === u.id ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm text-white/70">
                              Editing stats for <span className="text-white/90 font-medium">{u.fullName}</span>
                            </div>

                            <div className="flex gap-2">
                              <Button variant="ghost" onClick={cancelEditStats}>
                                <X className="h-4 w-4" />
                                Cancel
                              </Button>
                              <Button onClick={() => saveEditStats(u.id)}>
                                <Save className="h-4 w-4" />
                                Save
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {CHALLENGES.map((c) => {
                              const p = (draftChallenges?.[c.id] ?? u.challenges?.[c.id] ?? {});
                              return (
                                <div key={c.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <div className="text-sm font-semibold truncate">{c.title}</div>
                                      <div className="text-[11px] text-white/45 mt-1">{c.id}</div>
                                    </div>

                                    <select
                                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80"
                                      value={String(p.status || "unsolved")}
                                      onChange={(e) =>
                                        setDraftChallenges((s) => ({
                                          ...(s || {}),
                                          [c.id]: { ...(s?.[c.id] || {}), status: e.target.value },
                                        }))
                                      }
                                    >
                                      <option value="unsolved">unsolved</option>
                                      <option value="unlocked">unlocked</option>
                                      <option value="submitted">submitted</option>
                                    </select>
                                  </div>

                                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <div className="text-xs text-white/55 mb-2">Time (ms)</div>
                                      <Input
                                        value={p.timeMs ?? 0}
                                        onChange={(e) =>
                                          setDraftChallenges((s) => ({
                                            ...(s || {}),
                                            [c.id]: { ...(s?.[c.id] || {}), timeMs: e.target.value },
                                          }))
                                        }
                                        className="font-mono"
                                      />
                                    </div>

                                    <div>
                                      <div className="text-xs text-white/55 mb-2">Retakes</div>
                                      <Input
                                        value={p.attempts ?? 0}
                                        onChange={(e) =>
                                          setDraftChallenges((s) => ({
                                            ...(s || {}),
                                            [c.id]: { ...(s?.[c.id] || {}), attempts: e.target.value },
                                          }))
                                        }
                                        className="font-mono"
                                      />
                                    </div>

                                    <div className="sm:col-span-2">
                                      <div className="text-xs text-white/55 mb-2">Awarded Points</div>
                                      <Input
                                        value={p.pointsAwarded ?? 0}
                                        onChange={(e) =>
                                          setDraftChallenges((s) => ({
                                            ...(s || {}),
                                            [c.id]: { ...(s?.[c.id] || {}), pointsAwarded: e.target.value },
                                          }))
                                        }
                                        className="font-mono"
                                      />
                                    </div>
                                  </div>

                                  <div className="mt-3 text-[11px] text-white/40">
                                    Totals will auto-recalculate on Save.
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {CHALLENGES.map((c) => {
                            const p = u.challenges?.[c.id] || {};
                            const st = String(p.status || "unsolved");
                            return (
                              <div key={c.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold truncate">{c.title}</div>
                                    <div className="text-xs text-white/45 mt-1">
                                      Time:{" "}
                                      <span className="text-white/70">
                                        {formatTime(Math.floor((p.timeMs || 0) / 1000))}
                                      </span>
                                      {" • "}
                                      Retakes: <span className="text-white/70">{p.attempts || 0}</span>
                                    </div>
                                    <div className="text-xs text-white/45 mt-1">
                                      Awarded: <span className="text-white/70">{p.pointsAwarded || 0}</span>
                                    </div>
                                  </div>

                                  <span
                                    className={[
                                      "inline-flex items-center rounded-2xl border px-3 py-1 text-xs",
                                      statusPill(st),
                                    ].join(" ")}
                                  >
                                    {st}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
