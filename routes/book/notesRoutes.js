import express from "express";
import {
  createChapterNote,
  getChapterNotes,
  updateChapterNote,
  deleteChapterNote,
  getAllNotesGrouped,
} from "../../controller/book/notes/notesController.js";
import { protect } from "../../middleware/auth/protect.js";

const router = express.Router();

router.post("/:bookId/notes", protect, createChapterNote);
router.get("/:bookId/notes", getChapterNotes);
router.put("/notes/:noteId", protect, updateChapterNote);
router.delete("/notes/:noteId", protect, deleteChapterNote);
router.get("/notes/grouped", getAllNotesGrouped);

export default router;
