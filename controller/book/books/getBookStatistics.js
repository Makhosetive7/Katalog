import Book from "../../../model/book.js";

export const getBookStatistics = async (req, res) => {
  try {
    const { bookId } = req.params;

    // Fetch the book
    const book = await Book.findById(bookId).select(
      "title author pages chapters currentPage currentChapter completionPercentage createdAt updatedAt"
    );
    if (!book) return res.status(404).json({ error: "Book not found" });

    const now = new Date();
    const created = book.createdAt;
    const updated = book.updatedAt || now;

    // Total days tracked
    const daysTracked = Math.max(
      1,
      Math.ceil((updated - created) / (1000 * 60 * 60 * 24))
    );

    // Approximate pages and chapters per day
    const pagesPerDay = book.currentPage / daysTracked;
    const chaptersPerDay = book.currentChapter / daysTracked;

    // Estimated completion date based on current pace
    const remainingPages = book.pages - book.currentPage;
    const estimatedCompletionDate =
      pagesPerDay > 0
        ? new Date(now.getTime() + remainingPages / pagesPerDay * 24 * 60 * 60 * 1000)
        : null;

    res.json({
      book: {
        title: book.title,
        author: book.author,
        totalPages: book.pages,
        totalChapters: book.chapters,
      },
      reading: {
        totalPagesRead: book.currentPage,
        totalChaptersRead: book.currentChapter,
        completionPercentage: book.completionPercentage,
        pagesPerDay: pagesPerDay.toFixed(1),
        chaptersPerDay: chaptersPerDay.toFixed(2),
        estimatedCompletionDate: estimatedCompletionDate
          ? estimatedCompletionDate.toISOString().split("T")[0]
          : null,
        daysTracked,
      },
    });
  } catch (error) {
    console.error("Failed to get reading statistics:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
