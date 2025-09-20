import ChapterNote from "../../../model/chapterNote.js";

export const updateChapterNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { note, isPublic, keywords } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (note !== undefined) updateData.note = note;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (keywords !== undefined)
      updateData.keywords = Array.isArray(keywords) ? keywords : [keywords];

    updateData.updatedAt = new Date();

    const updatedNote = await ChapterNote.findOneAndUpdate(
      { _id: noteId, user: userId },
      updateData,
      { new: true, runValidators: true }
    ).populate("user", "username name");

    if (!updatedNote) {
      return res.status(404).json({ error: "Note not found or access denied" });
    }

    res.json({
      message: "Note updated successfully",
      note: updatedNote,
    });
  } catch (error) {
    console.error("Failed to update chapter note:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
