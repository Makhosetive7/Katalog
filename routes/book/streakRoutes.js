import express from "express";
import {
  getReadingStreak,
  updateReadingStreak,
} from "../../controller/book/readingStreaks/streakController.js";
import { protect } from "../../middleware/auth/protect.js";

const router = express.Router();

router.get("/readingStreak", protect, getReadingStreak);
router.put("/readingStreak", updateReadingStreak);

export default router;
