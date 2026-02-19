import { useMemo, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import BackgroundFX from "../components/layout/BackgroundFX";
import TopBar from "../components/layout/TopBar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { CHALLENGES, EVENT_TITLE } from "../data/challenges";
import { useCtfStore } from "../state/useCtfStore";
import { formatTime } from "../lib/time";
import {
  ArrowLeft,
  Trash2,
  Pencil,
  Save,
  RotateCcw,
  UserPlus,
  Download,
  Upload,
  CheckCircle2,
} from "lucide-react";

function isLocalhost() {
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h === "::1";
}

function totalsFor(user) {
  let totalPoints = 0;
  let solved = 0;
  let totalTimeMs = 0;

  for (const c of CHALLENGES) {
    const p = user.challenges?.[c.id];
    if (!p) continue;
    totalTimeMs += p.timeMs || 0;
    if (p.status === "solved") {
      solved += 1;
      totalPoints += p.pointsAwarded || 0;
    }
  }
  return { totalPoints, solved, totalTimeMs };
}

export default function Admin() {
  // ✅ hard-block on hosted
  if (!isLocalhost()) return <Navigate to="/" replace />;

  const { users, admin, activeUserId, totals, state } = useCtfStore();

  const [selectedId, setSelectedId] = useState(activeUserId);
  const selected = users.find((u) => u.id === selectedId) || users[0];

  const [editingName, setEditingName] = useState("");
  const [importText, setImportText] = useState("");
  const [toast, setToast] = useState("");

  const selectedTotals = useMemo(() => totalsFor(selected), [selected]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1500);
  };

  const doExport = async () => {
    const text = admin.exportJSON();
    await navigator.clipboard.writeText(text);
    showToast("Export copied to clipboard");
  };

  const doImport = () => {
    try {
      admin.importJSON(importText);
      setImportText("");
      showToast("Imported");
    } catch {
      showToast("Import failed (invalid JSON)");
    }
  };

  return (
    <div className="min-h-screen text-white">
      <BackgroundFX />
      <TopBar
        title={EVENT_TITLE}
        fullName={state.fullName}
        points={totals.totalPoints}
        time={formatTime(Math.floor(totals.totalTimeMs / 1000))}
      />

      {toast && (
        <div className="fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs text-emerald-200 backdrop-blur">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {toast}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-5 pb-20 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <div className="flex items-start justify-between gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>

            <div className="flex flex-wrap gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  admin.createUser("");
                  showToast("New user created");
                }}
              >
                <UserPlus className="h-4 w-4" />
                New User
              </Button>

              <Button variant="ghost" onClick={doExport} title="Copies JSON to clipboard">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
            {/* Left: users list */}
            <Card className="p-4" hover={false}>
              <div className="text-xs tracking-[0.35em] text-white/55">USERS</div>

              <div className="mt-4 space-y-2">
                {users.map((u) => {
                  const t = totalsFor(u);
                  const isActive = u.id === selectedId;

                  return (
                    <button
                      key={u.id}
                      onClick={() => setSelectedId(u.id)}
                      className={[
                        "w-full text-left rounded-2xl border px-4 py-3 transition",
                        isActive
                          ? "border-white/20 bg-white/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold tracking-tight">
                            {u.fullName?.trim() ? u.fullName : "Unnamed Team"}
                          </div>
                          <div className="mt-1 text-xs text-white/55">
                            Points: <span className="text-white/80">{t.totalPoints}</span>{" "}
                            • Solved: <span className="text-white/80">{t.solved}</span>
                          </div>
                        </div>
                        <div className="text-xs text-white/45">
                          {formatTime(Math.floor(t.totalTimeMs / 1000))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="text-xs tracking-[0.35em] text-white/55">IMPORT</div>
                <div className="mt-2 text-xs text-white/45">
                  Paste exported JSON here (from other devices) to merge/replace local data.
                </div>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="mt-3 w-full min-h-[120px] rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 outline-none focus:border-white/20"
                  placeholder='{"activeUserId":"...","users":[...]}'
                />
                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" onClick={doImport}>
                    <Upload className="h-4 w-4" />
                    Import
                  </Button>
                </div>
              </div>
            </Card>

            {/* Right: user details */}
            <Card className="p-6" hover={false}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-xs tracking-[0.35em] text-white/55">USER DETAILS</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight">
                    {selected.fullName?.trim() ? selected.fullName : "Unnamed Team"}
                  </div>
                  <div className="mt-2 text-sm text-white/60">
                    Points: <span className="text-white/85 font-medium">{selectedTotals.totalPoints}</span>{" "}
                    • Solved:{" "}
                    <span className="text-white/85 font-medium">{selectedTotals.solved}</span> /{" "}
                    {CHALLENGES.filter((c) => !c.comingSoon).length} • Time:{" "}
                    <span className="text-white/85 font-medium">
                      {formatTime(Math.floor(selectedTotals.totalTimeMs / 1000))}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const ok = window.confirm("Reset this user’s progress?");
                      if (!ok) return;
                      admin.resetUser(selected.id);
                      showToast("User reset");
                    }}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset User
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => {
                      const ok = window.confirm("Delete this user permanently?");
                      if (!ok) return;
                      admin.deleteUser(selected.id);
                      setSelectedId(users[0]?.id || "");
                      showToast("User deleted");
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>

              {/* Edit name */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                <div>
                  <div className="text-xs text-white/55 mb-2">Edit name</div>
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    placeholder="Type new name..."
                  />
                </div>
                <Button
                  onClick={() => {
                    admin.updateUser(selected.id, { fullName: editingName.trim() });
                    setEditingName("");
                    showToast("Name updated");
                  }}
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>

              {/* Challenges table */}
              <div className="mt-6">
                <div className="text-xs tracking-[0.35em] text-white/55">CHALLENGES</div>

                <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5 text-white/60">
                      <tr>
                        <th className="text-left p-3">Challenge</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Time</th>
                        <th className="text-left p-3">Attempts</th>
                        <th className="text-left p-3">Points</th>
                        <th className="text-right p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CHALLENGES.map((c) => {
                        const p = selected.challenges?.[c.id];
                        const timeStr = formatTime(Math.floor((p?.timeMs || 0) / 1000));
                        return (
                          <tr key={c.id} className="border-t border-white/10">
                            <td className="p-3">
                              <div className="font-semibold">{c.title}</div>
                              <div className="text-xs text-white/45">
                                {c.category} • {c.pointsMax} pts
                              </div>
                            </td>
                            <td className="p-3">
                              <select
                                className="rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 outline-none focus:border-white/20"
                                value={p?.status || "unsolved"}
                                onChange={(e) =>
                                  admin.updateUserChallenge(selected.id, c.id, {
                                    status: e.target.value,
                                  })
                                }
                              >
                                <option value="unsolved">unsolved</option>
                                <option value="solved">solved</option>
                              </select>
                            </td>
                            <td className="p-3">
                              <div className="text-white/85">{timeStr}</div>
                              <div className="mt-1 text-xs text-white/45">
                                <span className="mr-2">ms:</span>
                                <input
                                  className="w-28 rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 outline-none focus:border-white/20"
                                  type="number"
                                  value={p?.timeMs || 0}
                                  onChange={(e) =>
                                    admin.updateUserChallenge(selected.id, c.id, {
                                      timeMs: Math.max(0, Number(e.target.value || 0)),
                                    })
                                  }
                                />
                              </div>
                            </td>
                            <td className="p-3">
                              <input
                                className="w-24 rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 outline-none focus:border-white/20"
                                type="number"
                                value={p?.attempts || 0}
                                onChange={(e) =>
                                  admin.updateUserChallenge(selected.id, c.id, {
                                    attempts: Math.max(0, Number(e.target.value || 0)),
                                  })
                                }
                              />
                            </td>
                            <td className="p-3">
                              <input
                                className="w-24 rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 outline-none focus:border-white/20"
                                type="number"
                                value={p?.pointsAwarded || 0}
                                onChange={(e) =>
                                  admin.updateUserChallenge(selected.id, c.id, {
                                    pointsAwarded: Math.max(0, Number(e.target.value || 0)),
                                  })
                                }
                              />
                            </td>
                            <td className="p-3">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  onClick={() => admin.switchUser(selected.id)}
                                  title="Set as active user (dashboard uses active user)"
                                >
                                  <Pencil className="h-4 w-4" />
                                  Set Active
                                </Button>
                                <Button
                                  variant="ghost"
                                  onClick={() => {
                                    const ok = window.confirm(`Reset ${c.title} for this user?`);
                                    if (!ok) return;
                                    admin.updateUserChallenge(selected.id, c.id, {
                                      openedAt: null,
                                      timeMs: 0,
                                      attempts: 0,
                                      status: "unsolved",
                                      solvedAt: null,
                                      pointsAwarded: 0,
                                    });
                                    showToast("Challenge reset");
                                  }}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                  Reset
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 text-xs text-white/45">
                  Tip: Export JSON from each seminar device and import here to combine results.
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
