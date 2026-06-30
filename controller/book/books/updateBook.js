import Book from "../../../model/book.js";
import { logUserReadingActivity } from "../readingActivity/recordReadingActivity.js";

export const updateBook = async (req, res) => {
  try {
    const { title, genre, author, pages, chapters, status, rating, notes, imageUrl, isbn, description } =
      req.body;

    const updateBookDoc = req.book || (await Book.findById(req.params.id));
    const userId = req.userId;
    const previousStatus = updateBookDoc?.status;

    if (!updateBookDoc) {
      return res.status(404).json({ code: "NOT_FOUND", message: "Book not found" });
    }

    if (title) updateBookDoc.title = title;
    if (genre) updateBookDoc.genre = Array.isArray(genre) ? genre : [genre];
    if (author) updateBookDoc.author = author;
    if (pages) updateBookDoc.pages = parseInt(pages, 10);
    if (chapters) updateBookDoc.chapters = parseInt(chapters, 10);
    if (status) updateBookDoc.status = status;
    if (rating !== undefined) updateBookDoc.rating = parseFloat(rating);
    if (notes !== undefined) updateBookDoc.notes = notes;
    if (imageUrl) updateBookDoc.imageUrl = imageUrl;
    if (isbn) updateBookDoc.isbn = isbn;
    if (description) updateBookDoc.description = description;

    if (!updateBookDoc.timeline) updateBookDoc.timeline = {};

    if (status === "Completed" && previousStatus !== "Completed") {
      updateBookDoc.timeline.completedAt = new Date();
      updateBookDoc.completionPercentage = 100;
    }

    if (status === "In-Progress" && !updateBookDoc.timeline.startedAt) {
      updateBookDoc.timeline.startedAt = new Date();
    }

    const updatedBook = await updateBookDoc.save();

    if (status && status !== previousStatus) {
      await logUserReadingActivity(userId, {
        bookStarted: status === "In-Progress" && previousStatus !== "In-Progress",
        bookCompleted: status === "Completed" && previousStatus !== "Completed",
        progressUpdate: status === "In-Progress" || status === "Completed",
      });
    }

    res.json({
      message: "Book updated successfully",
      book: updatedBook,
    });
  } catch (error) {
    console.log("Failed updating book", error.message);
    res.status(500).json({ code: "SERVER_ERROR", message: "Server error" });
  }
};
