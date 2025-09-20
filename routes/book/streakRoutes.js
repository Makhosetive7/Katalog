import express from "express";
import {
  getReadingStreak,
  updateReadingStreak,
  checkStreakAchievements,
} from "../../controller/book/readingStreaks/streakController.js";

const router = express.Router();

router.get("/readingStreak", getReadingStreak);
router.put("/readingStreak", updateReadingStreak);
router.get("/streakAchievements", checkStreakAchievements);

export default router;
