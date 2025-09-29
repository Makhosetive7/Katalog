import Book from "../../../model/book.js";

export const createBook = async (req, res) => {
  try {
    const { title, genre, author, pages, chapters, status, rating } = req.body;
    const userId = req.user._id;

    if (!title || !genre || !author || !pages || !chapters) {
      return res.status(400).json({
        error: "Title, genre, author, pages, and chapters are required",
      });
    }

    const newBook = new Book({
      title,
      genre,
      author,
      pages,
      chapters,
      status,
      rating: rating || 0,
      user: userId,
    });

    const savedBook = await newBook.save();

    res.status(201).json({
      message: "Book created successfully",
      book: savedBook,
    });
  } catch (error) {
    console.error("Failed creating a book catalog:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
