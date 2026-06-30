import Book from "../../../model/book.js";

export const deleteBook = async (req, res) => {
  try {
    const book = req.book || (await Book.findById(req.params.id));

    if (!book) {
      return res.status(404).json({ code: "NOT_FOUND", message: "Book not found" });
    }

    await book.deleteOne();
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Failed deleting book:", error.message);
    res.status(500).json({ code: "SERVER_ERROR", message: "Server error" });
  }
};
