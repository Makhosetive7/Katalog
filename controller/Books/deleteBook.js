import Book from "../../model/book.js";

export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const bookDeletion = await Book.findByIdAndDelete(id);

    if (!bookDeletion) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Failed deleting book:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};