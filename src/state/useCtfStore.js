import { useEffect, useMemo, useState } from "react";
import { CHALLENGES } from "../data/challenges";
import { loadState, saveState } from "../lib/storage";

const makeInitial = () => ({
  fullName: "",
  startedAt: null,
  challenges: Object.fromEntries(
    CHALLENGES.map((c) => [
      c.id,
      {
        openedAt: null,
        timeMs: 0,
        solvedAt: null,
        submittedFlag: "",
        pointsAwarded: 0,
        attempts: 0, // ✅ important
        status: c.comingSoon ? "locked" : "unsolved",
      },
    ])
  ),
});

export function useCtfStore() {
  const [state, setState] = useState(() => loadState() || makeInitial());

  useEffect(() => saveState(state), [state]);

  const totals = useMemo(() => {
    const entries = Object.values(state.challenges);
    const totalTimeMs = entries.reduce((a, c) => a + (c.timeMs || 0), 0);
    const totalPoints = entries.reduce((a, c) => a + (c.pointsAwarded || 0), 0);
    const solvedCount = entries.filter((c) => c.status === "solved").length;
    return { totalTimeMs, totalPoints, solvedCount };
  }, [state.challenges]);

  return { state, setState, totals };
}
