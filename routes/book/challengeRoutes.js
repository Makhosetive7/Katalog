import express from "express";
import {
  setReadingChallenge,
  getReadingChallenge,
  getChallengeProgress,
  checkChallengeAchievement,
} from "../../controller/book/readingChallange/challangeController.js";
import { protect } from "../../middleware/auth/protect.js";

const router = express.Router();

router.post("/readingChallenge", protect, setReadingChallenge);
router.get("/readingChallenge", protect, getReadingChallenge);
router.get("/progress", protect, getChallengeProgress);
router.get("/achievementCheck", checkChallengeAchievement);

export default router;
