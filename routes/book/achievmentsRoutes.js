import express from "express";
import {
  getUserAchievements,
  checkBookAchievements,
  checkGenreAchievement,
  checkStreakAchievements,
} from "../../controller/book/readingAchievements/achievementsController.js";
import { protect } from "../../middleware/auth/protect.js";

const router = express.Router();

router.get("/userAchievements", protect, getUserAchievements);
router.get("/bookAchievements", protect, checkBookAchievements);
router.get("/genreAchievements", protect, checkGenreAchievement);
router.get("/streakAchievements", protect, checkStreakAchievements);

export default router;
