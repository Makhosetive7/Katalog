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

const router = express.Router();

router.post("/:bookId/goals", createReadingGoal);
router.get("/:bookId/goals", getBookGoals);
router.get("/goals/check", checkAllGoals);
router.get("/goals/stats", getGoalStatistics);
router.get("/goals/:goalId/progress", checkGoalProgress);
router.put("/goals/:goalId", updateReadingGoal);
router.delete("/goals/:goalId", deleteReadingGoal);

export default router;
