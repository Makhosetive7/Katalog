import ReadingGoal from "../../model/readingGoals.js";
import ReadingSession from "../../model/readingSession.js";
import Book from "../../model/book.js";

export const checkAllGoals = async (req, res) => {
  try {
    //const userId = req.params
    const now = new Date();

    // Get all active goals (not completed and not expired)
    const activeGoals = await ReadingGoal.find({
      //     user: userId,
      completed: false,
      endDate: { $gte: now },
    });

    const results = [];
    for (const goal of activeGoals) {
      const updatedGoal = await checkGoalProgress(goal._id);
      if (updatedGoal) {
        results.push(updatedGoal);
      }
    }

    res.json({
      message: "Goals checked successfully",
      updatedGoals: results.length,
      goals: results,
    });
  } catch (error) {
    console.error("Failed to check all goals:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
