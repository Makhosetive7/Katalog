import ReadingGoal from "../../../model/readingGoals.js";
import Book from "../../../model/book.js";

export const checkAllGoals = async (req, res) => {
  try {
    const  userId = req.user.id

    const goals = await ReadingGoal.find({ user: userId }).populate("book");
    if (!goals.length) return res.status(404).json({ error: "No goals found" });

    const now = new Date();
    const results = [];

    for (const goal of goals) {
      const book = await Book.findById(goal.book);
      if (!book) continue;

      let progress = 0;
      switch (goal.type) {
        case "pages":
          progress = book.currentPage || 0;
          break;
        case "chapters":
          progress = book.currentChapter || 0;
          break;
        case "completion":
          progress = book.completionPercentage || 0;
          break;
        case "time":
          progress = goal.progress || 0;
          break;
      }

      goal.progress = progress;
      if (progress >= goal.target && !goal.completed) {
        goal.completed = true;
        goal.completedAt = now;
      } else if (progress < goal.target && goal.completed) {
        goal.completed = false;
        goal.completedAt = null;
      }

      await goal.save();
      results.push({ goal });
    }

    res.json({ message: "All goals checked successfully", goals: results });
  } catch (error) {
    console.error("Failed to check all goals:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
