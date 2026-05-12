// 默认参数
const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;

export function calculateNextReview(card, quality) {
  // quality: 0-5, 0=完全忘记, 5=完美
  let { repetitions = 0, easeFactor = DEFAULT_EASE, intervalDays = 0 } = card;

  if (quality < 3) {
    // 忘记了，重置
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitions += 1;
  }

  // 更新难度系数
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < MIN_EASE) easeFactor = MIN_EASE;

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

  return {
    repetitions,
    easeFactor,
    intervalDays,
    nextReviewDate,
    lastReviewDate: new Date(),
    lastQuality: quality
  };
}

// 获取今天需要复习的单词 (nextReviewDate <= now)
export async function getDueReviews(db) {
  const now = new Date();
  const allReviews = await db.reviews.toArray();
  return allReviews.filter(r => new Date(r.nextReviewDate) <= now);
}