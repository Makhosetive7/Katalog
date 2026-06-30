import User from "../../model/user/user.js";
import Book from "../../model/book.js";
import ReadingStreak from "../../model/readingStreak.js";
import Achievement from "../../model/readingAchiervements.js";
import ReadingChallenge from "../../model/readingChallange.js";

export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password -verificationToken -resetPasswordToken -email"
    );

    if (!user) {
      return res.status(404).json({ code: "NOT_FOUND", message: "User not found" });
    }

    if (user.preferences?.privacy !== "public") {
      return res.status(403).json({
        code: "PRIVATE_PROFILE",
        message: "This profile is not public",
      });
    }

    const userId = user._id;
    const currentYear = new Date().getFullYear();

    const [completedBooks, streak, achievements, challenge] = await Promise.all([
      Book.find({ user: userId, status: "Completed" })
        .select("title author genre rating completionPercentage timeline.completedAt")
        .sort({ "timeline.completedAt": -1 })
        .limit(20),
      ReadingStreak.findOne({ user: userId }),
      Achievement.find({ user: userId })
        .select("title level type earnedAt")
        .sort({ earnedAt: -1 })
        .limit(10),
      ReadingChallenge.findOne({ user: userId, year: currentYear }),
    ]);

    const totalBooks = await Book.countDocuments({ user: userId });

    res.json({
      user: {
        username: user.username,
        profile: user.profile,
        memberSince: user.createdAt,
      },
      stats: {
        totalBooks,
        booksCompleted: completedBooks.length,
        currentStreak: streak?.currentStreak ?? 0,
        longestStreak: streak?.longestStreak ?? 0,
        challengeGoal: challenge?.goal ?? null,
        challengeProgress: challenge?.currentCount ?? 0,
      },
      recentBooks: completedBooks,
      achievements,
    });
  } catch (error) {
    res.status(500).json({ code: "SERVER_ERROR", message: error.message });
  }
};
