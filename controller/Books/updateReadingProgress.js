import Book from "../../model/book.js";

export const updateReadingProgress = async (req, res) => {
  try {
    const { currentPage, currentChapter, note } = req.body;
    const bookId = req.params.id;

    // Find the actual book document
    const bookProgress = await Book.findOne({ _id: bookId });

    if (!bookProgress) {
      return res.status(404).json({ message: "Book not found" });
    }

    // ✅ Use `bookProgress`, not `book`
    if (currentPage !== undefined) {
      if (currentPage > bookProgress.pages) {
        return res.status(400).json({
          message: "Current page cannot exceed total number of pages",
        });
      }
      bookProgress.currentPage = currentPage;
    }

    if (currentChapter !== undefined) {
      if (currentChapter > bookProgress.totalChapters) {
        return res.status(400).json({
          message: "Current chapter cannot exceed total available chapters",
        });
      }
      bookProgress.currentChapter = currentChapter; // ❌ you had `book.totalChapters = currentChapter`
    }

    // Add/update notes for chapter
    if (note && currentChapter !== undefined) {
      const existingNoteIndex = bookProgress.chapterNotes.findIndex(
        (n) => n.chapter === currentChapter
      );

      if (existingNoteIndex > -1) {
        bookProgress.chapterNotes[existingNoteIndex].note = note;
        bookProgress.chapterNotes[existingNoteIndex].createdAt = new Date();
      } else {
        bookProgress.chapterNotes.push({
          chapter: currentChapter,
          note: note,
        });
      }
    }

    // Recalculate completion %
    let completionPercentage = 0;

    if (bookProgress.pages > 0 && bookProgress.currentPage > 0) {
      completionPercentage = Math.round(
        (bookProgress.currentPage / bookProgress.pages) * 100
      );
    } else if (
      bookProgress.totalChapters > 0 &&
      bookProgress.currentChapter > 0
    ) {
      completionPercentage = Math.round(
        (bookProgress.currentChapter / bookProgress.totalChapters) * 100
      );
    }

    bookProgress.completionPercentage = Math.min(completionPercentage, 100);

    
    if (
      bookProgress.completionPercentage >= 100 &&
      bookProgress.status !== "Completed"
    ) {
      bookProgress.status = "Completed";
      bookProgress.dateCompleted = new Date();
    } else if (
      bookProgress.completionPercentage > 0 &&
      bookProgress.status === "Planned"
    ) {
      bookProgress.status = "In-Progress";
      if (!bookProgress.dateStarted) {
        bookProgress.dateStarted = new Date();
      }
    }

    const updatedBook = await bookProgress.save();

    res.json({
      message: "Progress updated successfully",
      book: updatedBook,
      completionPercentage: updatedBook.completionPercentage,
    });
  } catch (error) {
    console.log("Failed updating reading progress:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
