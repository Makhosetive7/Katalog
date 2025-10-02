import Book from "../../../model/book.js";

export const getAllBooks = async (req, res) => {
  try {
    const userId = req.user.id;

    const books = await Book.find({ user: userId });

    if (!books || books.length === 0) {
      return res.status(404).json({ message: "No books found for this user" });
    }

    res.status(200).json(books);
  } catch (error) {
    console.error("Error retrieving user's books:", error.message);
    res.status(500).json({ error: "Failed to retrieve books" });
  }
};