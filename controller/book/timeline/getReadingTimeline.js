import Book from "../../../model/book.js";

export const getReadingTimeline = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20 } = req.query;

    const books = await Book.find(
      { user: userId, $or: [{ currentPage: { $gt: 0 } }, { currentChapter: { $gt: 0 } }] },
      {
        title: 1,
        author: 1,
        currentPage: 1,
        currentChapter: 1,
        pages: 1,
        chapters: 1,
        timeline: 1, 
      }
    ).sort({ "timeline.startedAt": -1 });

    const timeline = books.slice(0, limit).map((book) => ({
      date: book.timeline?.completedAt || book.timeline?.startedAt,
      bookTitle: book.title,
      bookAuthor: book.author,
      pagesRead: book.currentPage || 0,
      chaptersRead: book.currentChapter || 0,
      totalPages: book.pages,
      totalChapters: book.chapters,
      completionPercentage: book.completionPercentage || 0,
    }));

    res.json(timeline);
  } catch (error) {
    console.error("Failed getting reading timeline:", error.message);
    res.status(500).json({ message: error.message });
  }
};
