import express from "express";
import {
  getUserAchievements,
  checkBookAchievements,
  checkGenreAchievement,
} from "../../controller/book/readingAchievements/achievementsController.js";

const router = express.Router();

router.get("/userAchievements", getUserAchievements);
router.get("/bookAchievements", checkBookAchievements);
router.get("/genreAchievements", checkGenreAchievement);

export default router;
