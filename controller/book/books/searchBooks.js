import Book from "../../../model/book.js";
import { parsePagination, paginatedResponse } from "../../../utils/pagination.js";

export const searchBooks = async (req, res) => {
  try {
    const search = req.query.q || req.query.search;

    if (!search || search.length < 2) {
      return res.status(400).json({
        code: "BAD_REQUEST",
        message: "Search query must be at least 2 characters long",
      });
    }

    const { page, limit, skip } = parsePagination(req.query);
    const filter = {
      user: req.userId,
      $or: [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { genre: { $regex: search, $options: "i" } },
      ],
    };

    const [bookSearch, total] = await Promise.all([
      Book.find(filter).sort({ title: 1 }).skip(skip).limit(limit),
      Book.countDocuments(filter),
    ]);

    res.json({
      query: search,
      ...paginatedResponse(bookSearch, total, page, limit),
    });
  } catch (error) {
    console.error("Failed searching book:", error.message);
    res.status(500).json({ code: "SERVER_ERROR", message: "Server error" });
  }
};
