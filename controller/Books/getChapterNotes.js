import Book from "../../model/book.js";

export const getChapterNotes = async (req, res) => {
  try {
    const {id} = req.params;

    const book = await Book.findOne({_id: id }, { chapterNotes: 1, title: 1 });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json({
      bookTitle: book.title,
      chapterNotes: book.chapterNotes.sort((a, b) => a.chapter - b.chapter),
    });
  } catch (error) {
    console.error("Failed get chapter notes", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
