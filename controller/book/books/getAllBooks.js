import Book from "../../../model/book.js";
import { parsePagination, paginatedResponse } from "../../../utils/pagination.js";

export const getAllBooks = async (req, res) => {
  try {
    const userId = req.userId;
    const { page, limit, skip } = parsePagination(req.query);

    const [books, total] = await Promise.all([
      Book.find({ user: userId }).sort({ updatedAt: -1 }).skip(skip).limit(limit),
      Book.countDocuments({ user: userId }),
    ]);

    res.status(200).json(paginatedResponse(books, total, page, limit));
  } catch (error) {
    console.error("Error retrieving user's books:", error.message);
    res.status(500).json({ code: "SERVER_ERROR", message: "Failed to retrieve books" });
  }
};
