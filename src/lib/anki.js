// Anki-style Algorithm with Learning Steps

/**
 * Helper to convert minutes into human-readable strings (e.g., "10m", "1d", "2mo")
 */
export function formatTime(minutes) {
  if (minutes < 60) {
    return `${Math.max(1, Math.round(minutes))}m`;
  }
  
  const hours = minutes / 60;
  if (hours < 24) {
    return `${Math.round(hours)}h`;
  }
  
  const days = hours / 24;
  if (days < 30) {
    return `${Math.round(days)}d`;
  }
  
  const months = days / 30;
  if (months < 12) {
    return `${Math.round(months)}mo`;
  }
  
  const years = months / 12;
  return `${Math.round(years)}y`;
}

/**
 * Calculate the 4 future intervals (in minutes) based on current card state.
 * Database interval is stored in days.
 */
export function calculateNextIntervals(card) {
  const { repetitions = 0, ease = 2.5, interval = 0 } = card;
  const currentIntervalMins = interval * 24 * 60;

  if (repetitions === 0) {
    // Phase: New Card
    return {
      again: 1, // 1m
      hard: 5,  // 5m
      good: 10, // 10m
      easy: 4 * 24 * 60 // 4d
    };
  } else {
    // Phase: Graduated (Dynamic SM-2 Expansion)
    // Ensures the user sees the time expanding dynamically on every press!
    // Minimum hard interval is 1.2x, good is 2.5x
    return {
      again: 1, // Relearn starts back at 1m
      hard: Math.max(currentIntervalMins * 1.2, currentIntervalMins + 5),
      good: Math.max(currentIntervalMins * ease, 1440), // Jump to 1 day minimum for Good!
      easy: Math.max(currentIntervalMins * ease * 1.3, 4 * 1440) // Jump to 4 days minimum for Easy
    };
  }
}

/**
 * Process a user's rating and return the updated card properties.
 * rating: 'again', 'hard', 'good', 'easy'
 */
export function processReview(card, rating) {
  let { repetitions = 0, ease = 2.5, interval = 0 } = card;
  const currentIntervalMins = interval * 24 * 60;
  
  const intervals = calculateNextIntervals(card);
  const nextIntervalMins = intervals[rating];
  
  // Calculate new Ease (drops on Again/Hard, increases on Easy)
  let newEase = ease;
  if (repetitions > 0) {
    if (rating === 'again') {
      newEase -= 0.20;
    } else if (rating === 'hard') {
      newEase -= 0.15;
    } else if (rating === 'easy') {
      newEase += 0.15;
    }
  }

  // Ensure ease never goes below 1.3
  if (newEase < 1.3) newEase = 1.3;

  // Calculate new Repetitions
  let newRepetitions = repetitions;
  if (rating === 'again') {
    newRepetitions = 0; // Reset to learning
  } else if (rating === 'good' || rating === 'easy') {
    newRepetitions += 1;
  }

  return {
    repetitions: newRepetitions,
    ease: parseFloat(newEase.toFixed(2)),
    interval: nextIntervalMins / (24 * 60) // Convert back to days for DB storage
  };
}
