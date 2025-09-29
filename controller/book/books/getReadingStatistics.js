import Book from "../../../model/book.js";
import ReadingChallenge from "../../../model/readingChallange.js";
import ReadingStreak from "../../../model/readingStreak.js";
import Achievement from "../../../model/readingAchiervements.js";

export const getReadingStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentYear = new Date().getFullYear();

    // Fetch books
    const books = await Book.find({ user: userId });

    // Calculate totals
    const totalBooks = books.length;
    const completedBooks = books.filter(b => b.completionPercentage === 100).length;
    const inProgressBooks = totalBooks - completedBooks;

    // Calculate total reading time (from velocity instead of sessions)
    const totalPagesRead = books.reduce((sum, b) => sum + (b.currentPage || 0), 0);
    const avgPagesPerDay =
      books.length > 0
        ? books.reduce((sum, b) => sum + (b.readingVelocity.avgPagesPerDay || 0), 0) /
          books.length
        : 0;

    // Fetch other stats
    const [readingChallenge, readingStreak, achievements, recentBooks] =
      await Promise.all([
        ReadingChallenge.findOne({ user: userId, year: currentYear }),
        ReadingStreak.findOne({ user: userId }),
        Achievement.find({ user: userId }),
        Book.find({ user: userId })
          .sort({ updatedAt: -1 })
          .limit(5)
          .select("title author coverImage status completionPercentage"),
      ]);

    const stats = {
      overview: {
        totalBooks,
        completedBooks,
        inProgressBooks,
        totalPagesRead,
        avgPagesPerDay: avgPagesPerDay.toFixed(1),
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
        count: achievements.length,
        recent: achievements
          .sort((a, b) => b.earnedAt - a.earnedAt)
          .slice(0, 3)
          .map(a => ({ title: a.title, level: a.level, earnedAt: a.earnedAt })),
      },
      recentBooks,
    };

    res.json(stats);
  } catch (error) {
    console.error("Failed getting user reading stats:", error.message);
    res.status(500).json({ message: error.message });
  }
};
