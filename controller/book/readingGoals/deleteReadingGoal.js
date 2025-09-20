import ReadingGoal from "../../../model/readingGoals.js";

export const deleteReadingGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const userId = req.params;

    const goal = await ReadingGoal.findOneAndDelete({
      _id: goalId,
      //  user: userId
    });

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error("Failed to delete reading goal:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
