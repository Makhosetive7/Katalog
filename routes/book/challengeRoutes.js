import express from "express";
import {
  setReadingChallenge,
  getReadingChallenge,
  getChallengeProgress,
} from "../../controller/book/readingChallange/challangeController.js";
import { checkChallengeAchievement } from "../../controller/book/readingChallange/checkChallengeAchievement.js";
import ReadingChallenge from "../../model/readingChallange.js";
import Achievement from "../../model/readingAchiervements.js";
import { protect } from "../../middleware/auth/protect.js";

const router = express.Router();

router.post("/readingChallenge", protect, setReadingChallenge);
router.get("/readingChallenge", protect, getReadingChallenge);
router.get("/progress", protect, getChallengeProgress);

router.get("/achievementCheck", protect, async (req, res) => {
  try {
    const challenge = await ReadingChallenge.findOne({
      user: req.userId,
      year: new Date().getFullYear(),
    });
    if (challenge) await checkChallengeAchievement(req.userId, challenge._id);
    const achievements = await Achievement.find({
      user: req.userId,
      type: "challenge_completed",
    }).sort({ earnedAt: -1 });
    res.json({ challenge, achievements });
  } catch (error) {
    res.status(500).json({ code: "SERVER_ERROR", message: error.message });
  }
});

export default router;
