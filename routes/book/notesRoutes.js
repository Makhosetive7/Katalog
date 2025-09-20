import express from "express";
import {
  createChapterNote,
  getChapterNotes,
  updateChapterNote,
  deleteChapterNote,
  getAllNotesGrouped,
} from "../../controller/book/notes/notesController.js";

const router = express.Router();

router.post("/:bookId/notes", createChapterNote);
router.get("/:bookId/notes", getChapterNotes);
router.put("/notes/:noteId", updateChapterNote);
router.delete("/notes/:noteId", deleteChapterNote);
router.get("/notes/grouped", getAllNotesGrouped);

export default router;
