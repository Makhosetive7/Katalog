import express from "express";
import {
  createReadingGoal,
  getBookGoals,
  checkAllGoals,
  getGoalStatistics,
  updateReadingGoal,
  deleteReadingGoal,
  checkGoalProgress,
} from "../../controller/book/readingGoals/goalsController.js";
import { protect } from "../../middleware/auth/protect.js";

const router = express.Router();

router.post("/:bookId/goals", protect, createReadingGoal);
router.get("/:bookId/goals", protect, getBookGoals);
router.get("/goals/check",protect, checkAllGoals);
router.get("/goals/stats", protect, getGoalStatistics);
router.get("/goals/:goalId/progress", protect, checkGoalProgress);
router.put("/goals/:goalId", protect, updateReadingGoal);
router.delete("/goals/:goalId", protect, deleteReadingGoal);

export default router;
