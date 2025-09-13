import ReadingSession from "../../model/readingSession.js"
import Book from "../../model/book.js";

export const deleteReadingSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await ReadingSession.findOneAndDelete({
      _id: sessionId,
      user: userId,
    });

    if (!session) {
      return res.status(404).json({ error: "Reading session not found" });
    }

    if (session.pagesRead > 0 || session.chaptersRead > 0) {
      const book = await Book.findById(session.book);
      if (book) {
        book.currentPage = Math.max(0, book.currentPage - session.pagesRead);
        book.currentChapter = Math.max(
          0,
          book.currentChapter - session.chaptersRead
        );
        book.updateCompletion();
        await book.save();
      }
    }

    res.json({ message: "Reading session deleted successfully" });
  } catch (error) {
    console.error("Failed to delete reading session:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
