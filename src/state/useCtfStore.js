// src/state/useCtfStore.js
import { useEffect, useMemo, useState } from "react";
import { CHALLENGES } from "../data/challenges";

const LS_KEY = "ctf_state_v2_users";

function blankProgress() {
  return {
    openedAt: null,
    timeMs: 0,
    attempts: 0, // you use this as retakes
    status: "unsolved", // unsolved | unlocked | submitted
    solvedAt: null, // when flag was unlocked (inside challenge)
    pointsAwarded: 0, // set when submitted on dashboard
    revealedFlag: "", // set when unlocked inside challenge
    submittedFlag: "", // set when submitted on dashboard
    submittedAt: null, // timestamp when submitted on dashboard
  };
}

// Build a fresh challenge progress object (for all challenge ids)
function freshChallenges() {
  const obj = {};
  for (const c of CHALLENGES) obj[c.id] = blankProgress();
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

function repairUserShape(u) {
  const user = { ...u };
  user.challenges = { ...(user.challenges || {}) };

  // ensure every challenge exists + has full fields
  for (const c of CHALLENGES) {
    const existing = user.challenges[c.id] || {};
    user.challenges[c.id] = {
      ...blankProgress(),
      ...existing,
    };

    // normalize legacy statuses
    // old code sometimes used "solved"
    if (user.challenges[c.id].status === "solved") {
      // treat old "solved" as "submitted" to preserve scoring if any
      user.challenges[c.id].status = "submitted";
    }
  }

  // ensure metadata fields exist
  user.fullName = user.fullName ?? "";
  user.createdAt = user.createdAt ?? Date.now();
  user.updatedAt = user.updatedAt ?? Date.now();

  return user;
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

    if (p.status === "submitted") {
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
    const usersRaw = Array.isArray(parsed.users) ? parsed.users : [];

    if (usersRaw.length === 0) {
      const u = freshUser("");
      return { activeUserId: u.id, users: [u] };
    }

    const users = usersRaw.map(repairUserShape);

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

  // ✅ setState updates ACTIVE USER only
  const setState = (updater) => {
    setDb((prev) => {
      const idx = prev.users.findIndex((u) => u.id === prev.activeUserId);
      if (idx === -1) return prev;

      const current = prev.users[idx];
      const nextUserState = typeof updater === "function" ? updater(current) : updater;

      const repaired = repairUserShape(nextUserState);
      const users = prev.users.slice();
      users[idx] = { ...repaired, updatedAt: Date.now() };

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
          u.id === id ? repairUserShape({ ...u, ...patch, updatedAt: Date.now() }) : u
        );
        return { ...prev, users };
      }),

    updateUserChallenge: (id, chId, patch) =>
      setDb((prev) => {
        const users = prev.users.map((u) => {
          if (u.id !== id) return u;

          const challenges = { ...(u.challenges || {}) };
          const base = challenges[chId] ? { ...blankProgress(), ...challenges[chId] } : blankProgress();

          challenges[chId] = { ...base, ...patch };

          return repairUserShape({
            ...u,
            updatedAt: Date.now(),
            challenges,
          });
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
        const activeUserId = prev.activeUserId === id ? users[0].id : prev.activeUserId;
        return { ...prev, users, activeUserId };
      }),

    resetUser: (id) =>
      setDb((prev) => {
        const users = prev.users.map((u) =>
          u.id === id
            ? repairUserShape({
                ...u,
                updatedAt: Date.now(),
                challenges: freshChallenges(),
              })
            : u
        );
        return { ...prev, users };
      }),

    exportJSON: () => JSON.stringify(db, null, 2),

    importJSON: (jsonText) =>
      setDb(() => {
        const parsed = JSON.parse(jsonText);
        save(parsed);
        return load();
      }),
  };

  return {
    state: activeUser,
    setState,
    totals,
    users: db.users,
    activeUserId: db.activeUserId,
    admin,
  };
}
