import Achievement from "../../../model/readingAchiervements.js";
import ReadingStreak from "../../../model/readingStreak.js";
import ReadingSession from "../../../model/readingSession.js";
import ReadingActivity from "../../../model/readingActivity.js";

export const buildRichProgressPayload = async ({
  userId,
  book,
  previousPage,
  requestStartedAt,
  activeGoals = [],
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [streak, newAchievements, todayActivity, todaySessions] = await Promise.all([
    ReadingStreak.findOne({ user: userId }),
    Achievement.find({
      user: userId,
      earnedAt: { $gte: requestStartedAt },
    }).sort({ earnedAt: -1 }),
    ReadingActivity.findOne({ user: userId, date: today }),
    ReadingSession.find({
      user: userId,
      date: { $gte: today },
    }),
  ]);

  const pagesToday =
    (todayActivity?.pagesLogged ?? 0) +
    todaySessions.reduce((sum, s) => sum + (s.pagesRead || 0), 0);

  const pagesRemaining = Math.max(0, (book.pages || 0) - (book.currentPage || 0));
  const avgPagesPerDay = parseFloat(book.readingVelocity?.avgPagesPerDay) || 0;
  const paceToFinish =
    pagesRemaining > 0 && avgPagesPerDay > 0
      ? Math.ceil(pagesRemaining / avgPagesPerDay)
      : null;

  const goalsCompleted = activeGoals.filter((g) => g.completed);

  return {
    book: {
      id: book._id,
      title: book.title,
      author: book.author,
      currentPage: book.currentPage,
      currentChapter: book.currentChapter,
      status: book.status,
      completionPercentage: book.completionPercentage,
      velocity: book.readingVelocity,
    },
    streak: streak
      ? {
          current: streak.currentStreak,
          longest: streak.longestStreak,
          isNewRecord: streak.currentStreak > 0 && streak.currentStreak === streak.longestStreak,
          lastReadingDate: streak.lastReadingDate,
        }
      : null,
    goalsCompleted: goalsCompleted.map((g) => ({
      id: g._id,
      type: g.type,
      target: g.target,
      progress: g.progress,
    })),
    achievementsUnlocked: newAchievements.map((a) => ({
      id: a._id,
      title: a.title,
      description: a.description,
      level: a.level,
      type: a.type,
      earnedAt: a.earnedAt,
    })),
    insights: {
      pagesLoggedThisUpdate: Math.max(0, (book.currentPage ?? 0) - (previousPage ?? 0)),
      pagesToday,
      paceToFinishDays: paceToFinish,
      paceToFinishLabel:
        paceToFinish != null
          ? paceToFinish === 1
            ? "1 day at current pace"
            : `${paceToFinish} days at current pace`
          : null,
    },
    updatedGoals: activeGoals.map((g) => ({
      id: g._id,
      progress: g.progress,
      target: g.target,
      completed: g.completed,
    })),
  };
};
