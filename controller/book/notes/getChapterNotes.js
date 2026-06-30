import ChapterNote from "../../../model/chapterNote.js";

export const getChapterNotes = async (req, res) => {
  try {
    const { bookId } = req.params;
    const notes = await ChapterNote.find({ user: req.userId, book: bookId })
      .populate("book")
      .sort({ chapter: 1, createdAt: -1 });

    if (!notes || notes.length === 0) {
      return res.json({
        book: null,
        chapters: {},
        totalNotes: 0,
      });
    }

    const grouped = notes.reduce((acc, note) => {
      if (!acc[note.chapter]) acc[note.chapter] = [];
      acc[note.chapter].push({
        _id: note._id,
        chapter: note.chapter,
        note: note.note,
        isPublic: note.isPublic,
        keywords: note.keywords,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      });
      return acc;
    }, {});

    res.json({
      book: notes[0].book,
      chapters: grouped,
      totalNotes: notes.length,
    });
  } catch (error) {
    console.error("Failed to get chapter notes:", error.message);
    res.status(500).json({ code: "SERVER_ERROR", message: "Server error" });
  }
};
