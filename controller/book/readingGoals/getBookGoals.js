import ReadingGoal from "../../../model/readingGoals.js";

export const getBookGoals = async (req, res) => {
  try {
    const { bookId } = req.params;
    // const userId = req.params

    const goals = await ReadingGoal.find({
      //    user: userId,
      book: bookId,
    }).sort({ createdAt: -1 });

    res.json({
      goals,
      count: goals.length,
    });
  } catch (error) {
    console.error("Failed to get reading goals:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
