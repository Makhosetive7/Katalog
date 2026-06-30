import Book from "../../../model/book.js";

export const getRecentBooks = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 5, 50);
    const books = await Book.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(books);
  } catch (error) {
    console.error("Failed getting recent added books:", error.message);
    res.status(500).json({ code: "SERVER_ERROR", message: "Server error" });
  }
};
