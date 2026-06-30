import express from "express";
import {
  getReadingStreak,
} from "../../controller/book/readingStreaks/streakController.js";
import { httpUpdateReadingStreak } from "../../controller/book/readingAchievements/achievementsController.js";
import { protect } from "../../middleware/auth/protect.js";

const router = express.Router();

router.get("/readingStreak", protect, getReadingStreak);
router.put("/readingStreak", protect, httpUpdateReadingStreak);

export default router;
