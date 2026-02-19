import { useEffect, useMemo, useState } from "react";
import { CHALLENGES } from "../data/challenges";

const LS_KEY = "ctf_state_v2_users";

// Build a fresh challenge progress object
function freshChallenges() {
  const obj = {};
  for (const c of CHALLENGES) {
    obj[c.id] = {
      openedAt: null,
      timeMs: 0,
      attempts: 0,
      status: "unsolved", // unsolved | solved
      solvedAt: null,
      pointsAwarded: 0,
    };
  }
  return obj;
}

function freshUser(name = "") {
  return {
    id: crypto.randomUUID(),
    fullName: name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    challenges: freshChallenges(),
  };
}

function computeTotals(user) {
  const challenges = user?.challenges || {};
  let totalPoints = 0;
  let solvedCount = 0;
  let totalTimeMs = 0;

  for (const c of CHALLENGES) {
    const p = challenges[c.id];
    if (!p) continue;
    totalTimeMs += p.timeMs || 0;
    if (p.status === "solved") {
      solvedCount += 1;
      totalPoints += p.pointsAwarded || 0;
    }
  }

  return { totalPoints, solvedCount, totalTimeMs };
}

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      const u = freshUser("");
      return { activeUserId: u.id, users: [u] };
    }
    const parsed = JSON.parse(raw);

    // basic shape repair
    const users = Array.isArray(parsed.users) ? parsed.users : [];
    if (users.length === 0) {
      const u = freshUser("");
      return { activeUserId: u.id, users: [u] };
    }

    // ensure challenges exist
    for (const u of users) {
      u.challenges = u.challenges || {};
      for (const c of CHALLENGES) {
        if (!u.challenges[c.id]) {
          u.challenges[c.id] = {
            openedAt: null,
            timeMs: 0,
            attempts: 0,
            status: "unsolved",
            solvedAt: null,
            pointsAwarded: 0,
          };
        }
      }
    }

    const activeUserId =
      parsed.activeUserId && users.some((u) => u.id === parsed.activeUserId)
        ? parsed.activeUserId
        : users[0].id;

    return { activeUserId, users };
  } catch {
    const u = freshUser("");
    return { activeUserId: u.id, users: [u] };
  }
}

function save(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export function useCtfStore() {
  const [db, setDb] = useState(() => load());

  // Persist any changes
  useEffect(() => {
    save(db);
  }, [db]);

  const activeUser = useMemo(
    () => db.users.find((u) => u.id === db.activeUserId) || db.users[0],
    [db]
  );

  const totals = useMemo(() => computeTotals(activeUser), [activeUser]);

  // ✅ setState updates ACTIVE USER only (keeps your existing code pattern)
  const setState = (updater) => {
    setDb((prev) => {
      const idx = prev.users.findIndex((u) => u.id === prev.activeUserId);
      if (idx === -1) return prev;

      const current = prev.users[idx];
      const nextUserState = typeof updater === "function" ? updater(current) : updater;

      const users = prev.users.slice();
      users[idx] = { ...nextUserState, updatedAt: Date.now() };

      return { ...prev, users };
    });
  };

  // ✅ Admin helpers
  const admin = {
    createUser: (fullName = "") =>
      setDb((prev) => {
        const u = freshUser(fullName);
        return { ...prev, users: [u, ...prev.users], activeUserId: u.id };
      }),

    switchUser: (id) =>
      setDb((prev) => {
        if (!prev.users.some((u) => u.id === id)) return prev;
        return { ...prev, activeUserId: id };
      }),

    updateUser: (id, patch) =>
      setDb((prev) => {
        const users = prev.users.map((u) =>
          u.id === id ? { ...u, ...patch, updatedAt: Date.now() } : u
        );
        return { ...prev, users };
      }),

    updateUserChallenge: (id, chId, patch) =>
      setDb((prev) => {
        const users = prev.users.map((u) => {
          if (u.id !== id) return u;
          return {
            ...u,
            updatedAt: Date.now(),
            challenges: {
              ...u.challenges,
              [chId]: { ...u.challenges[chId], ...patch },
            },
          };
        });
        return { ...prev, users };
      }),

    deleteUser: (id) =>
      setDb((prev) => {
        const users = prev.users.filter((u) => u.id !== id);
        if (users.length === 0) {
          const u = freshUser("");
          return { activeUserId: u.id, users: [u] };
        }
        const activeUserId =
          prev.activeUserId === id ? users[0].id : prev.activeUserId;
        return { ...prev, users, activeUserId };
      }),

    resetUser: (id) =>
      setDb((prev) => {
        const users = prev.users.map((u) =>
          u.id === id
            ? {
                ...u,
                updatedAt: Date.now(),
                challenges: freshChallenges(),
              }
            : u
        );
        return { ...prev, users };
      }),

    exportJSON: () => JSON.stringify(db, null, 2),

    importJSON: (jsonText) =>
      setDb(() => {
        const parsed = JSON.parse(jsonText);
        // reuse load repair logic by saving to LS then loading
        save(parsed);
        return load();
      }),
  };

  // Keep old API surface: { state, setState, totals }
  // plus admin helpers + all users list for admin panel
  return {
    state: activeUser,
    setState,
    totals,
    users: db.users,
    activeUserId: db.activeUserId,
    admin,
  };
}
