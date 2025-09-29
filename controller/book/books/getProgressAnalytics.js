import Book from "../../../model/book.js";

export const getProgressAnalytics = async (req, res) => {
  try {
    const { id: bookId } = req.params;

    const book = await Book.findById(bookId, {
      title: 1,
      author: 1,
      genre: 1,
      publishedDate: 1,
      description: 1,
      coverImageUrl: 1,
      pages: 1,
      chapters: 1,
      currentPage: 1,
      currentChapter: 1,
      completionPercentage: 1,
    });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const totalPagesRead = book.currentPage || 0;
    const totalChaptersRead = book.currentChapter || 0;

    const pagePercentage =
      book.pages > 0 ? Math.round((totalPagesRead / book.pages) * 100) : 0;
    const chapterPercentage =
      book.chapters > 0
        ? Math.round((totalChaptersRead / book.chapters) * 100)
        : 0;

    const analytics = {
      bookTitle: book.title,
      completionPercentage: Math.max(pagePercentage, chapterPercentage),
      byPages: {
        current: totalPagesRead,
        total: book.pages,
        percentage: pagePercentage,
      },
      byChapters: {
        current: totalChaptersRead,
        total: book.chapters,
        percentage: chapterPercentage,
      },
      recommendedMetric: book.pages > 0 ? "pages" : "chapters",
    };

    res.json({
      analytics,
      bookDetails: {
        title: book.title,
        author: book.author,
        genre: book.genre,
        publishedDate: book.publishedDate,
        description: book.description,
        coverImageUrl: book.coverImageUrl,
      },
    });
  } catch (error) {
    console.error("Failed getting progress analytics", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
