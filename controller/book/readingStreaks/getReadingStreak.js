import ReadingStreak from "../../../model/readingStreak.js";

export const getReadingStreak = async (req, res) => {
  try {
    const streak = await ReadingStreak.findOne({
      user: req.user.id,
    });

    if (!streak) {
      return res.json({ currentStreak: 0, longestStreak: 0 });
    }

    res.json({
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastReadingDate: streak.lastReadingDate,
    });
  } catch (error) {
    console.log("Failed getting reading streak");
    res.status(500).json({ message: error.message });
  }
};
