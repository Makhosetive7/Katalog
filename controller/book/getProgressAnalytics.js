import Book from "../../model/book.js";

export const getProgressAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findOne(
      { _id: id },
      {
        completionPercentage: 1,
        currentPage: 1,
        pages: 1,
        currentChapter: 1,
        totalChapters: 1,
        title: 1,
      }
    );

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const analytics = {
      bookTitle: book.title,
      completionPercentage: book.completionPercentage,
      byPages: {
        current: book.currentPage,
        total: book.pages,
        percentage:
          book.pages > 0
            ? Math.round((book.currentPage / book.pages) * 100)
            : 0,
      },
      byChapters: {
        current: book.currentChapter,
        total: book.totalChapters,
        percentage:
          book.totalChapters > 0
            ? Math.round((book.currentChapter / book.totalChapters) * 100)
            : 0,
      },
      recommendedMetric: book.pages > 0 ? "pages" : "chapters",
    };

    res.json(analytics);
  } catch (error) {
    console.error("Failed getting progress analytics", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
