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
import { assertBookOwner, assertGoalOwner } from "../../middleware/auth/ownership.js";

const router = express.Router();

router.post("/:bookId/goals", protect, assertBookOwner, createReadingGoal);
router.get("/:bookId/goals", protect, assertBookOwner, getBookGoals);
router.get("/goals/check", protect, checkAllGoals);
router.get("/goals/stats/:userId/:bookId", protect, getGoalStatistics);
router.get("/goals/:goalId/progress", protect, assertGoalOwner, checkGoalProgress);
router.put("/goals/:goalId", protect, assertGoalOwner, updateReadingGoal);
router.delete("/goals/:goalId", protect, assertGoalOwner, deleteReadingGoal);

export default router;
