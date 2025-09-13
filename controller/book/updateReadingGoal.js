import ReadingGoal from "../../model/readingGoals.js";
import ReadingSession from "../../model/readingSession.js";
import Book from "../../model/book.js";

export const updateReadingGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { target, endDate } = req.body;
    // const userId = req.params;

    const updateData = {};
    if (target !== undefined) updateData.target = target;
    if (endDate !== undefined) updateData.endDate = new Date(endDate);

    const goal = await ReadingGoal.findOneAndUpdate(
      {
        _id: goalId,
        //   user: userId,
      },
      updateData,
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    await checkGoalProgress(goalId);
    const updatedGoal = await ReadingGoal.findById(goalId);

    res.json({
      message: "Goal updated successfully",
      goal: updatedGoal,
    });
  } catch (error) {
    console.error("Failed to update reading goal:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
