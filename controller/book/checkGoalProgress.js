import ReadingGoal from "../../model/readingGoals.js";
import ReadingSession from "../../model/readingSession.js";
import Book from "../../model/book.js";

export const checkGoalProgress = async (req, res) => {
  try {
    const { goalId } = req.params;

    const goal = await ReadingGoal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    const now = new Date();
    let progress = 0;

    const sessionFilter = {
      user: goal.user,
      book: goal.book,
      date: { $gte: goal.startDate, $lte: goal.endDate },
    };

    const sessions = await ReadingSession.find(sessionFilter);

    switch (goal.type) {
      case "pages":
        progress = sessions.reduce(
          (sum, session) => sum + session.pagesRead,
          0
        );
        break;

      case "chapters":
        progress = sessions.reduce(
          (sum, session) => sum + session.chaptersRead,
          0
        );
        break;

      case "time":
        progress = sessions.reduce(
          (sum, session) => sum + session.readingTime,
          0
        );
        break;

      case "completion":
        const book = await Book.findById(goal.book);
        if (book) {
          progress = book.completionPercentage || 0;
        }
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
    
    res.json({
      message: "Goal progress checked successfully",
      goal: goal,
      sessionsUsed: sessions.length
    });
    
  } catch (error) {
    console.error("Failed to check goal progress:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};