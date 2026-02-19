export function computePoints({ pointsMax, seconds, wrongAttempts = 0 }) {
  // Time scoring:
  // Full points within 5 minutes, then -10% every 2 minutes after 5 mins, floor at 40%.
  const FIVE_MIN = 5 * 60;     // 300s
  const STEP = 2 * 60;         // 120s
  const DECAY_PERCENT = 0.10;  // 10% per step after 5 min
  const MIN_TIME_PERCENT = 0.40;

  let timePercent = 1;

  if (seconds > FIVE_MIN) {
    const extraTime = seconds - FIVE_MIN;
    const steps = Math.floor(extraTime / STEP);
    timePercent = Math.max(1 - steps * DECAY_PERCENT, MIN_TIME_PERCENT);
  }

  // Retry penalty:
  // Every wrong attempt reduces points by 7%, floor multiplier at 70%.
  const ATTEMPT_PENALTY = 0.07;  // 7% per wrong attempt
  const MIN_ATTEMPT_MULT = 0.70; // never go below 70% from attempts alone
  const attemptMult = Math.max(1 - wrongAttempts * ATTEMPT_PENALTY, MIN_ATTEMPT_MULT);

  const final = pointsMax * timePercent * attemptMult;
  return Math.max(0, Math.round(final));
}
