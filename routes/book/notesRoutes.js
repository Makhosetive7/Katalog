import express from "express";
import {
  createChapterNote,
  getChapterNotes,
  updateChapterNote,
  deleteChapterNote,
  getAllNotesGrouped,
} from "../../controller/book/notes/notesController.js";
import { protect } from "../../middleware/auth/protect.js";
import { assertBookOwner, assertNoteOwner } from "../../middleware/auth/ownership.js";

const router = express.Router();

router.post("/:bookId/notes", protect, assertBookOwner, createChapterNote);
router.get("/:bookId/notes", protect, assertBookOwner, getChapterNotes);
router.put("/notes/:noteId", protect, assertNoteOwner, updateChapterNote);
router.delete("/notes/:noteId", protect, assertNoteOwner, deleteChapterNote);
router.get("/notes/grouped", protect, getAllNotesGrouped);

export default router;
