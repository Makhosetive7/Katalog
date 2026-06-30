import express from "express";
import {
  getBookSessions,
  createReadingSession,
  deleteReadingSession,
} from "../../controller/book/readingSessions/sessionController.js";
import { protect } from "../../middleware/auth/protect.js";
import { assertBookOwner } from "../../middleware/auth/ownership.js";

const router = express.Router();

router.get("/:bookId/sessions", protect, assertBookOwner, getBookSessions);
router.post("/:bookId/sessions", protect, assertBookOwner, createReadingSession);
router.delete("/sessions/:sessionId", protect, deleteReadingSession);

export default router;
