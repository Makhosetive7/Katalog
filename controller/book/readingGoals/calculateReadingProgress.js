import ReadingGoal from "../../../model/readingGoals.js";
import Book from "../../../model/book.js";

export const calculateGoalProgress = async (goalId) => {
  try {
    const goal = await ReadingGoal.findById(goalId);
    if (!goal) throw new Error("Goal not found");

    const now = new Date();
    let progress = 0;

    const book = await Book.findById(goal.book);
    if (!book) throw new Error("Book not found");

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
    return goal;
  } catch (error) {
    console.error("Failed to calculate goal progress:", error.message);
    throw error;
  }
};
