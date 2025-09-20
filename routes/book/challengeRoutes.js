import express from "express";
import {
  setReadingChallenge,
  getReadingChallenge,
  getChallengeProgress,
  checkChallengeAchievement
} from "../../controller/book/readingChallange/challangeController.js";

const router = express.Router();

router.post("/readingChallenge", setReadingChallenge);
router.get("/readingChallenge", getReadingChallenge);
router.get("/progress", getChallengeProgress);
router.get("/achievementCheck", checkChallengeAchievement);

export default router;
