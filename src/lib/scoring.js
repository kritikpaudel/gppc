// src/lib/scoring.js

export function computePoints({ pointsMax, seconds, retakes = 0 }) {
  // ---- Your time scoring rule ----
  // "points within 5 mins. points decrease per 2mins after 5 min."
  // We'll keep it simple and deterministic.

  const base = Number(pointsMax || 0);
  const t = Math.max(0, Number(seconds || 0));

  // Full points for first 5 minutes
  const grace = 5 * 60; // 300s

  let timePoints = base;

  if (t > grace) {
    const extra = t - grace;
    const steps = Math.ceil(extra / (2 * 60)); // every 2 minutes after 5 min
    // Decrease 10% of max per step, clamp to >= 0
    timePoints = Math.max(0, Math.round(base * (1 - 0.1 * steps)));
  }

  // ---- Retake penalty: -10% per retake ----
  const r = Math.max(0, Number(retakes || 0));
  const multiplier = Math.pow(0.9, r);

  const finalPoints = Math.max(0, Math.round(timePoints * multiplier));
  return finalPoints;
}
