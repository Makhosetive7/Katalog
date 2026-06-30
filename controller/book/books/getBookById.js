import Book from "../../../model/book.js";

export const getBookById = async (req, res) => {
  try {
    const book = req.book || (await Book.findById(req.params.id));

    if (!book) {
      return res.status(404).json({ code: "NOT_FOUND", message: "Book not available" });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error("Failed fetching book by ID:", error.message);
    res.status(500).json({ code: "SERVER_ERROR", message: "Server error" });
  }
};
