import Book from "../../../model/book.js";
import { logUserReadingActivity } from "../readingActivity/recordReadingActivity.js";

export const createBook = async (req, res) => {
  try {
    const {
      title,
      genre,
      author,
      pages,
      chapters,
      status,
      rating,
      imageUrl,
      isbn,
      description,
      openLibraryKey,
    } = req.body;
    const userId = req.userId;

    if (!title || !author) {
      return res.status(400).json({
        code: "BAD_REQUEST",
        message: "Title and author are required",
      });
    }

    const newBook = new Book({
      title,
      genre: genre ? (Array.isArray(genre) ? genre : [genre]) : [],
      author,
      pages: pages || 0,
      chapters: chapters || 0,
      status: status || "Planned",
      rating: rating || 0,
      imageUrl,
      isbn,
      description,
      openLibraryKey,
      user: userId,
    });

    const savedBook = await newBook.save();

    if (status === "In-Progress") {
      await logUserReadingActivity(userId, { bookStarted: true, progressUpdate: true });
    }

    res.status(201).json({
      message: "Book created successfully",
      book: savedBook,
    });
  } catch (error) {
    console.error("Failed creating a book catalog:", error.message);
    res.status(500).json({ code: "SERVER_ERROR", message: "Server error" });
  }
};
