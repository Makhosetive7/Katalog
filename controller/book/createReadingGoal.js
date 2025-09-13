import ReadingGoal from "../../model/readingGoals.js";
import ReadingSession from "../../model/readingSession.js";
import Book from "../../model/book.js";
import { checkGoalProgress } from "./checkGoalProgress.js";
import { calculateGoalProgress } from "./calculateReadingProgress.js";


// In createReadingGoal controller
export const createReadingGoal = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { type, target, timeframe, endDate } = req.body;
    // const userId = req.user.id;

    if (!type || !target || !endDate) {
      return res
        .status(400)
        .json({ error: "Type, target, and endDate are required" });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const readingGoal = new ReadingGoal({
      // user: userId,
      book: bookId,
      type,
      target,
      timeframe,
      endDate: new Date(endDate),
    });

    await readingGoal.save();

    await calculateGoalProgress(readingGoal._id);

    const updatedGoal = await ReadingGoal.findById(readingGoal._id);

    res.status(201).json({
      message: "Reading goal created successfully",
      goal: updatedGoal,
    });
  } catch (error) {
    console.error("Failed to create reading goal:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
