import ReadingSession from "../../model/readingSession.js"
import Book from "../../model/book.js";
import mongoose from "mongoose";

export const getReadingStatistics = async (req, res) => {
  try {
    const { bookId } = req.params;
    //const userId = req.user.id;

    const stats = await ReadingSession.aggregate([
      {
        $match: {
      //    user: new mongoose.Types.ObjectId(userId),
          book: new mongoose.Types.ObjectId(bookId),
        },
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalPagesRead: { $sum: "$pagesRead" },
          totalChaptersRead: { $sum: "$chaptersRead" },
          totalReadingTime: { $sum: "$readingTime" },
          avgPagesPerSession: { $avg: "$pagesRead" },
          avgReadingTime: { $avg: "$readingTime" },
          moodDistribution: { $push: "$mood" },
        },
      },
    ]);

    const result = stats[0] || {
      totalSessions: 0,
      totalPagesRead: 0,
      totalChaptersRead: 0,
      totalReadingTime: 0,
      avgPagesPerSession: 0,
      avgReadingTime: 0,
      moodDistribution: [],
    };

    const moodCounts = {};
    result.moodDistribution.forEach((mood) => {
      if (mood) {
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      }
    });

    res.json({
      ...result,
      moodCounts,
      totalReadingHours: (result.totalReadingTime / 60).toFixed(1),
    });
  } catch (error) {
    console.error("Failed to get reading statistics:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
