import Book from "../../../model/book.js";
import ReadingSession from "../../../model/readingSession.js";
import mongoose from "mongoose";

export const  getBookStatistics = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const stats = await ReadingSession.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
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
          firstSession: { $min: "$date" },
          lastSession: { $max: "$date" },
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
      firstSession: null,
      lastSession: null,
    };

    const moodCounts = {};
    result.moodDistribution.forEach((mood) => {
      if (mood) {
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      }
    });

    // Get book details
    const book = await Book.findById(bookId).select(
      "title author pages chapters"
    );

    res.json({
      book: {
        title: book?.title,
        author: book?.author,
        totalPages: book?.pages,
        totalChapters: book?.chapters,
      },
      sessions: {
        total: result.totalSessions,
        first: result.firstSession,
        last: result.lastSession,
      },
      reading: {
        totalPagesRead: result.totalPagesRead,
        totalChaptersRead: result.totalChaptersRead,
        totalReadingHours: (result.totalReadingTime / 60).toFixed(1),
        avgPagesPerSession: result.avgPagesPerSession.toFixed(1),
        avgReadingTime: result.avgReadingTime.toFixed(1),
      },
      moodAnalysis: moodCounts,
    });
  } catch (error) {
    console.error("Failed to get reading statistics:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
