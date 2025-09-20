import express from "express";
import {
  createReadingSession,
  getBookReadingSessions,
  getReadingStatistics,
  deleteReadingSession,
} from "../../controller/book/readingSession/sessionController.js";

const router = express.Router();

router.post("/:bookId/sessions", createReadingSession);
router.get("/:bookId/sessions", getBookReadingSessions);
router.get("/reading-stats", getReadingStatistics);
router.delete("/sessions/:sessionId", deleteReadingSession);

export default router;
