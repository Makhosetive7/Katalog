import ChapterNote from "../../model/chapterNote.js";
import Book from "../../model/book.js";

// Create a new chapter note
export const createChapterNote = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { chapter, note, isPublic = false, keywords = [] } = req.body;
    //  const userId = req.user.id;

    if (!chapter || !note) {
      return res.status(400).json({ error: "Chapter and note are required" });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const chapterNote = new ChapterNote({
      //    user: userId,
      book: bookId,
      chapter: parseInt(chapter),
      note,
      isPublic,
      keywords: Array.isArray(keywords) ? keywords : [keywords],
    });

    await chapterNote.save();
    await chapterNote.populate("user", "username name");

    res.status(201).json({
      message: "Chapter note created successfully",
      note: chapterNote,
    });
  } catch (error) {
    console.error("Failed to create chapter note:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
