import ReadingGoal from "../../../model/readingGoals.js";

export const getGoalStatistics = async (req, res) => {
  try {
    //  const userId = req.params;

    const stats = await ReadingGoal.aggregate([
      {
        $match: {
          //user: mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          totalGoals: { $sum: 1 },
          completedGoals: { $sum: { $cond: ["$completed", 1, 0] } },
          activeGoals: {
            $sum: {
              $cond: [
                { $and: ["$completed", { $gte: ["$endDate", new Date()] }] },
                0,
                1,
              ],
            },
          },
          avgCompletion: { $avg: "$progress" },
        },
      },
    ]);

    const result = stats[0] || {
      totalGoals: 0,
      completedGoals: 0,
      activeGoals: 0,
      avgCompletion: 0,
    };

    res.json(result);
  } catch (error) {
    console.error("Failed to get goal statistics:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
