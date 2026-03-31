export interface SM2Input {
  quality: number;
  easeFactor: number;
  interval: number;
  repetitions: number;
}

export interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
  mastery: number;
}

export function sm2(input: SM2Input): SM2Result {
  const { quality } = input;
  let { easeFactor, interval, repetitions } = input;

  if (quality < 0 || quality > 5) {
    throw new Error("Quality must be between 0 and 5");
  }

  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(1.3, easeFactor);

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  const mastery = calculateMastery(repetitions, easeFactor, interval);

  return {
    easeFactor: Math.round(easeFactor * 100) / 100,
    interval,
    repetitions,
    nextReview,
    mastery,
  };
}

function calculateMastery(
  repetitions: number,
  easeFactor: number,
  interval: number
): number {
  const repScore = Math.min(repetitions / 8, 1) * 40;
  const intervalScore = Math.min(interval / 60, 1) * 30;
  const easeScore = Math.min((easeFactor - 1.3) / 1.7, 1) * 30;
  return Math.min(100, Math.round(repScore + intervalScore + easeScore));
}

export function qualityLabel(quality: number): string {
  switch (quality) {
    case 0:
      return "Blackout";
    case 1:
      return "Wrong";
    case 2:
      return "Almost";
    case 3:
      return "Hard";
    case 4:
      return "Good";
    case 5:
      return "Easy";
    default:
      return "Unknown";
  }
}
