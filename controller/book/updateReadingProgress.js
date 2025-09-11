import Book from "../../model/book.js";

export const updateReadingProgress = async (req, res) => {
  try {
    const { currentPage, currentChapter, note, status } = req.body;
    const bookId = req.params.id;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    let pagesRead = 0;

    // --- Update Pages ---
    if (currentPage !== undefined) {
      if (currentPage > book.pages) {
        return res.status(400).json({
          message: "Current page cannot exceed total number of pages",
        });
      }

      if (currentPage > book.currentPage) {
        pagesRead = currentPage - book.currentPage;

        // Push to readingTimeline
        const today = new Date().toISOString().split("T")[0];
        const existingEntry = book.readingTimeline.find(
          (entry) => entry.date.toISOString().split("T")[0] === today
        );

        if (existingEntry) {
          existingEntry.pagesRead += pagesRead;
        } else {
          book.readingTimeline.push({
            date: new Date(),
            pagesRead,
            chapter: currentChapter || book.currentChapter,
          });
        }
      }

      book.currentPage = currentPage;
    }

    // --- Update Chapters ---
    if (currentChapter !== undefined) {
      if (currentChapter > book.chapters) {
        return res.status(400).json({
          message: "Current chapter cannot exceed total chapters",
        });
      }
      book.currentChapter = currentChapter;
    }

    // --- Update Notes ---
    if (note && currentChapter !== undefined) {
      const existingNote = book.chapterNotes.find(
        (n) => n.chapter === currentChapter
      );
      if (existingNote) {
        existingNote.note = note;
        existingNote.createdAt = new Date();
      } else {
        book.chapterNotes.push({ chapter: currentChapter, note });
      }
    }

    // --- Update Completion ---
    if (book.pages > 0) {
      book.completionPercentage = Math.round(
        (book.currentPage / book.pages) * 100
      );
    } else if (book.chapters > 0) {
      book.completionPercentage = Math.round(
        (book.currentChapter / book.chapters) * 100
      );
    }
    book.completionPercentage = Math.min(book.completionPercentage, 100);

    // --- Update Status ---
    if (status) {
      book.status = status;
    } else {
      if (book.completionPercentage >= 100) {
        book.status = "Completed";
        book.timeline.completedAt = new Date();
      } else if (book.completionPercentage > 0 && book.status === "Planned") {
        book.status = "In-Progress";
        if (!book.timeline.startedAt) book.timeline.startedAt = new Date();
      }
    }

    const updatedBook = await book.save();

    res.json({
      message: "Progress updated successfully",
      book: updatedBook,
      completionPercentage: updatedBook.completionPercentage,
    });
  } catch (error) {
    console.error("❌ Failed updating reading progress:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
