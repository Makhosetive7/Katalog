import ReadingGoal from "../../model/readingGoals.js";
import ReadingSession from "../../model/readingSession.js";
import Book from "../../model/book.js";

export const checkAllGoals = async (req, res) => {
  try {
    //   const { userId } = req.params;

    const goals = await ReadingGoal.find({
      // user: userId,
    }).populate("book");
    if (!goals.length) {
      return res.status(404).json({ error: "No goals found" });
    }

    const now = new Date();
    const results = [];

    for (const goal of goals) {
      let progress = 0;

      const sessionFilter = {
        user: goal.user,
        book: goal.book,
        date: { $gte: goal.startDate, $lte: goal.endDate },
      };

      const sessions = await ReadingSession.find(sessionFilter);

      switch (goal.type) {
        case "pages":
          progress = sessions.reduce((sum, s) => sum + s.pagesRead, 0);
          break;
        case "chapters":
          progress = sessions.reduce((sum, s) => sum + s.chaptersRead, 0);
          break;
        case "time":
          progress = sessions.reduce((sum, s) => sum + s.readingTime, 0);
          break;
        case "completion":
          const book = await Book.findById(goal.book);
          if (book) progress = book.completionPercentage || 0;
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

      results.push({
        goal,
        sessionsUsed: sessions.length,
      });
    }

    res.json({
      message: "All goals checked successfully",
      goals: results,
    });
  } catch (error) {
    console.error("Failed to check all goals:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
