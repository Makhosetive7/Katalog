import ReadingSession from "../../../model/readingSession.js";
import Book from "../../../model/book.js";

export const getBookReadingSessions = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { startDate, endDate, limit = 50, page = 1 } = req.query;
    // const userId = req.user.id;

    const filter = {
      //   user: userId,
      book: bookId,
    };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const options = {
      sort: { date: -1 },
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
    };

    const sessions = await ReadingSession.find(filter, null, options);
    const totalCount = await ReadingSession.countDocuments(filter);

    res.json({
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Failed to get reading sessions:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
