import { calculateGoalProgress } from "./calculateReadingProgress.js";

export const checkGoalProgress = async (req, res) => {
  try {
    const { goalId } = req.params;

    const updatedGoal = await calculateGoalProgress(goalId);

    res.json({
      message: "Goal progress checked successfully",
      goal: updatedGoal,
    });
  } catch (error) {
    console.error("Failed to check goal progress:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
