import Book from "../../model/book.js";
import ReadingChallenge from "../../model/readingChallange.js";
import ReadingStreak from "../../model/readingStreak.js";
import Achievement from "../../model/readingAchiervements.js";
import ReadingSession from "../../model/readingSession.js";
import mongoose from "mongoose";

export const getReadingStatistics = async (req, res) => {
  try {
    // const userId = req.user.id;
    const currentYear = new Date().getFullYear();

    const [
      totalBooks,
      completedBooks,
      readingChallenge,
      readingStreak,
      achievements,
      totalReadingSessions,
      recentBooks,
    ] = await Promise.all([
      Book.countDocuments({
        // user: userId,
      }),
      Book.countDocuments({
        // user: userId,
        status: "Completed",
      }),
      ReadingChallenge.findOne({
        // user: userId,
        year: currentYear,
      }),
      ReadingStreak.findOne({
        // user: userId,
      }),
      Achievement.countDocuments({
        // user: userId
      }),
      ReadingSession.countDocuments({
        // user: userId,
      }),
      Book.find({
        // user: userId,
      })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select("title author coverImage status completionPercentage"),
    ]);

    const readingTimeStats = await ReadingSession.aggregate([
      {
        $match: {
          // user: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          totalReadingTime: { $sum: "$readingTime" },
          avgReadingTime: { $avg: "$readingTime" },
          totalSessions: { $sum: 1 },
        },
      },
    ]);

    const readingTimeData = readingTimeStats[0] || {
      totalReadingTime: 0,
      avgReadingTime: 0,
      totalSessions: 0,
    };

    const stats = {
      overview: {
        totalBooks,
        completedBooks,
        inProgressBooks: totalBooks - completedBooks,
        totalReadingSessions,
        totalReadingHours: (readingTimeData.totalReadingTime / 60).toFixed(1),
        avgSessionMinutes: readingTimeData.avgReadingTime.toFixed(1),
      },
      readingChallenge: readingChallenge
        ? {
            goal: readingChallenge.goal,
            current: readingChallenge.currentCount,
            percentage: Math.round(
              (readingChallenge.currentCount / readingChallenge.goal) * 100
            ),
            completed: readingChallenge.completed,
            booksLeft: readingChallenge.goal - readingChallenge.currentCount,
          }
        : null,
      readingStreak: readingStreak
        ? {
            current: readingStreak.currentStreak,
            longest: readingStreak.longestStreak,
            lastReadingDate: readingStreak.lastReadingDate,
          }
        : { current: 0, longest: 0, lastReadingDate: null },
      achievements: {
        count: achievements,
        recent: await Achievement.find({
          // user: userId
        })
          .sort({ earnedAt: -1 })
          .limit(3)
          .select("title level earnedAt"),
      },
      recentBooks,
    };

    res.json(stats);
  } catch (error) {
    console.log("Failed getting user reading stats");
    res.status(500).json({ message: error.message });
  }
};