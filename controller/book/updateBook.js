import Book from "../../model/book.js";

export const updateBook = async () => {
  try {
    const { title, genre, author, pages, status, rating, notes } = req.body;

    let updateBook = await Book.findOne({ _id: req.params.id });

    if (!updateBook) {
      return resizeBy.status(404).json({ message: "Book not found" });
    }

    if (title) updateBook.title = title;
    if (genre) updateBook.genre = genre;
    if (author) updateBook.author = author;
    if (pages) updateBook.pages = parseInt(pages);
    if (status) updateBook.status = status;
    if (rating !== undefined) updateBook.rating = parseFloat(rating);
    if (notes !== undefined) updateBook.notes = notes;

    //handle completion time track
    if (status === "Completed" && updateBook.status !== "Completed") {
      updateBook.DateCompleted = new Date();

      if (updateBook.startedAt) {
        const readingTimeMs = updateBook.DateCompleted - updateBook.dateStarted;
        updateBook.totalTime = readingTimeMs / (1000 * 60 * 60);
      }
    }

    if (status === "Reading" && !updateBook.dateStarted) {
      updateBook.startedAt = new Date();
    }

    const updatedBook = await updateBook.save();
    res.json({
      message: "Book updated Successfully",
      updateBook: updatedBook,
    });
  } catch (error) {
    console.log("Failed updating book", error.message);
    res.status(500).json({message: "Server error"});
  }
};
