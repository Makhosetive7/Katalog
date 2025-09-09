import Book from "../../model/book.js";

export const createBook = async (req, res) => {
  try {
    const { title, genre, author, pages, status, rating } = req.body;

    if (!title || !genre || !author || !pages) {
      return res
        .status(400)
        .json({ error: "Title, genre, author, and pages are required" });
    }

    let newBook = new Book({
      title,
      genre,
      author,
      pages,
      status: status || "Planned",
      rating: rating || 0,
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
