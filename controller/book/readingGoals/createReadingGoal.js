import ReadingGoal from "../../../model/readingGoals.js";
import Book from "../../../model/book.js";
import { calculateGoalProgress } from "./calculateReadingProgress.js";

export const createReadingGoal = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { type, target, timeframe, endDate } = req.body;
    const userId = req.user.id;

    if (!type || !target || !endDate) {
      return res
        .status(400)
        .json({ error: "Type, target, and endDate are required" });
    }

    if (typeof target !== "number" || target <= 0) {
      return res
        .status(400)
        .json({ error: "Target must be a positive number" });
    }

    const goalEndDate = new Date(endDate);
    const currentDate = new Date();
    if (goalEndDate <= currentDate) {
      return res.status(400).json({ error: "endDate must be a future date" });
    }

    const maxEndDate = new Date();
    maxEndDate.setFullYear(maxEndDate.getFullYear() + 1);
    if (goalEndDate > maxEndDate) {
      return res
        .status(400)
        .json({ error: "endDate cannot be more than one year in the future" });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    if (type === "pages" || type === "completion") {
      if (!book.pages || book.pages <= 0) {
        return res.status(400).json({
          message: "Book page count is not available",
        });
      }
    }

    if (target > book.pages) {
      return res.status(400).json({
        error: `Target pages (${target}) cannot exceed total book pages (${book.pages})`,
      });
    }

    if (type === "completion" && target > 100) {
      return res.status(400).json({
        message: "Completion target can not exceed 100%",
      });
    }

    const targetLimits = {
      pages: { min: 1, max: book.pages || 1000 },
      chapters: { min: 1, max: 100 },
      minutes: { min: 1, max: 1000 },
      completion: { min: 1, max: 100 },
    };

    const limits = targetLimits[type];
    if (limits) {
      if (target < limits.min) {
        return res.status(400).json({
          error: `Target for ${type} goals must be at least ${limits.min}`,
        });
      }
      if (target > limits.max) {
        return res.status(400).json({
          error: `Target for ${type} goals cannot exceed ${limits.max}`,
        });
      }
    }

    const readingGoal = new ReadingGoal({
      user: userId,
      book: bookId,
      type,
      target,
      timeframe,
      endDate: goalEndDate,
      status: "active",
    });

    await readingGoal.save();

    await calculateGoalProgress(readingGoal._id);

    const updatedGoal = await ReadingGoal.findById(readingGoal._id)
      .populate("book", "title author pages")
      .lean();

    res.status(201).json({
      message: "Reading goal created successfully",
      goal: updatedGoal,
    });
  } catch (error) {
    console.error("Failed to create reading goal:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
