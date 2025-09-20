import ReadingSession from "../../../model/readingSession.js";
import Book from "../../../model/book.js";
import ReadingGoal from "../../../model/readingGoals.js";
import { calculateGoalProgress } from "../../book/readingGoals/calculateReadingProgress.js";
import { updateReadingStreak } from "../../book/readingStreaks/updateReadingStreak.js";

export const createReadingSession = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { pagesRead, chaptersRead, readingTime, mood, date } = req.body;
    //   const userId = req.user.id;

    if (!pagesRead && !chaptersRead) {
      return res
        .status(400)
        .json({ error: "Pages read or chapters read is required" });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const readingSession = new ReadingSession({
      //   user: userId,
      book: bookId,
      pagesRead: pagesRead || 0,
      chaptersRead: chaptersRead || 0,
      readingTime: readingTime || 0,
      mood,
      date: date ? new Date(date) : new Date(),
    });

    await readingSession.save();

    // NEW: Update reading streak
    await updateReadingStreak();
    // userId

    // Update book progress
    if (pagesRead > 0 || chaptersRead > 0) {
      book.currentPage += pagesRead || 0;
      book.currentChapter += chaptersRead || 0;
      book.updateCompletion();
      await book.save();
    }

    try {
      const activeGoals = await ReadingGoal.find({
        //   user: userId,
        book: bookId,
        completed: false,
      });

      for (const goal of activeGoals) {
        await calculateGoalProgress(goal._id);
      }
    } catch (goalError) {
      console.log("Goal check failed:", goalError.message);
    }

    res.status(201).json({
      message: "Reading session logged successfully",
      session: readingSession,
    });
  } catch (error) {
    console.error("Failed to create reading session:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
