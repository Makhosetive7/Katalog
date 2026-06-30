import express from "express";
import {
  getUserAchievements,
  httpCheckBookAchievements,
  httpCheckGenreAchievements,
  httpCheckStreakAchievements,
} from "../../controller/book/readingAchievements/achievementsController.js";
import { protect } from "../../middleware/auth/protect.js";

const router = express.Router();

router.get("/userAchievements", protect, getUserAchievements);
router.get("/bookAchievements", protect, httpCheckBookAchievements);
router.get("/genreAchievements", protect, httpCheckGenreAchievements);
router.get("/streakAchievements", protect, httpCheckStreakAchievements);

export default router;
