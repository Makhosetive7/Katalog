import ChapterNote from "../../model/chapterNote.js";
import Book from "../../model/book.js";

export const getChapterNotes = async (req, res) => {
  try {
    const { bookId } = req.params;

    // Get all notes for this book
    const note = await ChapterNote.find({ book: bookId })
      .sort({ chapter: 1, createdAt: -1 });

    res.json({
      note,
      count: note.length,
    });
  } catch (error) {
    console.error("Failed to get chapter note:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};