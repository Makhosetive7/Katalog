import Book from "../../../model/book.js";

export const getRecentBooks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const books = await Book.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(books);
  } catch (error) {
    console.error("Failed getting recent added books:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
