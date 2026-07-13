// Anki-style Algorithm with Learning Steps

/**
 * Helper to convert minutes into human-readable strings (e.g., "10m", "1d", "1.5mo")
 */
export function formatTime(minutes) {
  if (minutes < 60) {
    return `< ${Math.max(1, Math.round(minutes))}m`;
  }
  
  const hours = minutes / 60;
  if (hours < 24) {
    return `${Math.round(hours)}h`;
  }
  
  const days = hours / 24;
  if (days < 30) {
    return `${Math.round(days * 10) / 10}d`;
  }
  
  const months = days / 30;
  if (months < 12) {
    return `${Math.round(months * 10) / 10}mo`;
  }
  
  const years = months / 12;
  return `${Math.round(years * 10) / 10}y`;
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
  } else if (currentIntervalMins < 1440) { // Less than 1 day
    // Phase: Learning / Relearning
    return {
      again: 1, // 1m
      hard: 10, // 10m
      good: 1440, // 1d
      easy: 4 * 24 * 60 // 4d
    };
  } else {
    // Phase: Graduated (SM-2)
    return {
      again: 10, // 10m (Relearn)
      hard: currentIntervalMins * 1.2,
      good: currentIntervalMins * ease,
      easy: currentIntervalMins * ease * 1.3
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
  
  // Calculate new Ease (only changes for Graduated cards, or drops heavily on Again)
  let newEase = ease;
  if (currentIntervalMins >= 1440) { // Graduated
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
