import ChapterNote from "../../../model/chapterNote.js";
import Book from "../../../model/book.js";

export const deleteChapterNote = async (req, res) => {
  try {
    const { noteId } = req.params;
     const userId = req.user.id;

    const deletedNote = await ChapterNote.findOneAndDelete({
      _id: noteId,
       user: userId,
    });

    if (!deletedNote) {
      return res.status(404).json({ error: "Note not found or access denied" });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Failed to delete chapter note:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
