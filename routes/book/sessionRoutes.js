import express from "express";
import {
  createReadingSession,
  getBookReadingSessions,
  getReadingStatistics,
  deleteReadingSession,
} from "../../controller/book/readingSession/sessionController.js";
import { protect } from "../../middleware/auth/protect.js";
const router = express.Router();

router.post("/:bookId/sessions", protect, createReadingSession);
router.get("/:bookId/sessions", protect, getBookReadingSessions);
router.get("/reading-stats", protect, getReadingStatistics);
router.delete("/sessions/:sessionId", protect, deleteReadingSession);

export default router;
