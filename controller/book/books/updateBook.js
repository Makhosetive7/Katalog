import Book from "../../../model/book.js";

export const updateBook = async (req, res) => {
  try {
    const { title, genre, author, pages, status, rating, notes } = req.body;

    let updateBook = await Book.findOne({ _id: req.params.id });

    if (!updateBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (title) updateBook.title = title;
    if (genre) updateBook.genre = genre;
    if (author) updateBook.author = author;
    if (pages) updateBook.pages = parseInt(pages);
    if (status) updateBook.status = status;
    if (rating !== undefined) updateBook.rating = parseFloat(rating);
    if (notes !== undefined) updateBook.notes = notes;

    if (status === "Completed" && updateBook.status !== "Completed") {
      updateBook.DateCompleted = new Date();

      if (updateBook.startedAt) {
        const readingTimeMs = updateBook.DateCompleted - updateBook.startedAt;
        updateBook.totalTime = readingTimeMs / (1000 * 60 * 60);
      }
    }

    if (status === "Reading" && !updateBook.startedAt) {
      updateBook.startedAt = new Date();
    }

    const updatedBook = await updateBook.save();
    res.json({
      message: "Book updated successfully",
      book: updatedBook,
    });
  } catch (error) {
    console.log("Failed updating book", error.message);
    res.status(500).json({ message: "Server error" });
  }
};