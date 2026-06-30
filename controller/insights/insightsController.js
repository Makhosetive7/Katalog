import Book from "../../model/book.js";
import ReadingSession from "../../model/readingSession.js";
import ReadingActivity from "../../model/readingActivity.js";
import ReadingStreak from "../../model/readingStreak.js";
import ReadingGoal from "../../model/readingGoals.js";
import Achievement from "../../model/readingAchiervements.js";

export const getWeeklyInsights = async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);

    const [sessions, prevSessions, activities, streak, goals, recentAchievements, inProgress] =
      await Promise.all([
        ReadingSession.find({ user: userId, date: { $gte: weekStart } }),
        ReadingSession.find({ user: userId, date: { $gte: prevWeekStart, $lt: weekStart } }),
        ReadingActivity.find({ user: userId, date: { $gte: weekStart } }),
        ReadingStreak.findOne({ user: userId }),
        ReadingGoal.find({ user: userId, completed: false }),
        Achievement.find({ user: userId })
          .sort({ earnedAt: -1 })
          .limit(3),
        Book.find({ user: userId, status: "In-Progress" }).limit(5),
      ]);

    const pagesThisWeek =
      sessions.reduce((s, x) => s + (x.pagesRead || 0), 0) +
      activities.reduce((s, x) => s + (x.pagesLogged || 0), 0);
    const pagesPrevWeek = prevSessions.reduce((s, x) => s + (x.pagesRead || 0), 0);
    const pagesChange =
      pagesPrevWeek > 0
        ? Math.round(((pagesThisWeek - pagesPrevWeek) / pagesPrevWeek) * 100)
        : pagesThisWeek > 0
          ? 100
          : 0;

    const sessionsCount = sessions.length;
    const activeDays = new Set([
      ...sessions.map((s) => new Date(s.date).toDateString()),
      ...activities.map((a) => new Date(a.date).toDateString()),
    ]).size;

    const goalsDueSoon = goals.filter((g) => {
      if (!g.endDate) return false;
      const daysLeft = (new Date(g.endDate) - now) / (1000 * 60 * 60 * 24);
      return daysLeft >= 0 && daysLeft <= 7;
    });

    const streakAtRisk = (() => {
      if (!streak?.lastReadingDate) return streak?.currentStreak > 0;
      const last = new Date(streak.lastReadingDate);
      last.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return last.getTime() < yesterday.getTime() && streak.currentStreak > 0;
    })();

    const narratives = [];
    if (pagesThisWeek > 0) {
      narratives.push(`You read ${pagesThisWeek} pages this week.`);
    }
    if (pagesChange !== 0) {
      narratives.push(
        pagesChange > 0
          ? `That's ${pagesChange}% more than last week.`
          : `That's ${Math.abs(pagesChange)}% less than last week.`
      );
    }
    if (streak?.currentStreak > 0) {
      narratives.push(`Your current streak is ${streak.currentStreak} days.`);
    }
    if (streakAtRisk) {
      narratives.push("Log reading today to keep your streak alive.");
    }
    if (goalsDueSoon.length > 0) {
      narratives.push(
        `${goalsDueSoon.length} goal${goalsDueSoon.length === 1 ? "" : "s"} due within 7 days.`
      );
    }

    res.json({
      period: { start: weekStart, end: now },
      summary: {
        pagesRead: pagesThisWeek,
        pagesChangePercent: pagesChange,
        sessionsCount,
        activeDays,
        booksInProgress: inProgress.length,
      },
      streak: streak
        ? {
            current: streak.currentStreak,
            longest: streak.longestStreak,
            atRisk: streakAtRisk,
          }
        : null,
      goalsDueSoon: goalsDueSoon.map((g) => ({
        id: g._id,
        book: g.book,
        type: g.type,
        target: g.target,
        progress: g.progress,
        endDate: g.endDate,
      })),
      continueReading: inProgress.map((b) => ({
        id: b._id,
        title: b.title,
        author: b.author,
        completionPercentage: b.completionPercentage,
        currentPage: b.currentPage,
        pages: b.pages,
      })),
      recentAchievements: recentAchievements.map((a) => ({
        title: a.title,
        level: a.level,
        earnedAt: a.earnedAt,
      })),
      narratives,
    });
  } catch (error) {
    res.status(500).json({ code: "SERVER_ERROR", message: error.message });
  }
};

export const getBookPace = async (req, res) => {
  try {
    const book = req.book;
    const pagesRemaining = Math.max(0, (book.pages || 0) - (book.currentPage || 0));
    const avgPagesPerDay = parseFloat(book.readingVelocity?.avgPagesPerDay) || 0;
    const daysToFinish =
      pagesRemaining > 0 && avgPagesPerDay > 0
        ? Math.ceil(pagesRemaining / avgPagesPerDay)
        : null;

    const finishDate =
      daysToFinish != null
        ? new Date(Date.now() + daysToFinish * 24 * 60 * 60 * 1000)
        : null;

    res.json({
      bookId: book._id,
      title: book.title,
      pagesRemaining,
      avgPagesPerDay,
      daysToFinish,
      estimatedFinishDate: finishDate,
      completionPercentage: book.completionPercentage,
    });
  } catch (error) {
    res.status(500).json({ code: "SERVER_ERROR", message: error.message });
  }
};
