import Book from "../../model/book.js";
import ChapterNote from "../../model/chapterNote.js";
import ReadingGoal from "../../model/readingGoals.js";
import { sendForbidden, sendNotFound } from "../../utils/apiError.js";

export const assertBookOwner = async (req, res, next) => {
  try {
    const bookId = req.params.id || req.params.bookId;
    if (!bookId) return next();

    const book = await Book.findById(bookId);
    if (!book) return sendNotFound(res, "Book not found");
    if (book.user.toString() !== req.userId.toString()) {
      return sendForbidden(res, "Not authorized to access this book");
    }

    req.book = book;
    next();
  } catch (error) {
    res.status(500).json({ code: "SERVER_ERROR", message: error.message });
  }
};

export const assertNoteOwner = async (req, res, next) => {
  try {
    const note = await ChapterNote.findById(req.params.noteId);
    if (!note) return sendNotFound(res, "Note not found");
    if (note.user.toString() !== req.userId.toString()) {
      return sendForbidden(res, "Not authorized to access this note");
    }
    req.note = note;
    next();
  } catch (error) {
    res.status(500).json({ code: "SERVER_ERROR", message: error.message });
  }
};

export const assertGoalOwner = async (req, res, next) => {
  try {
    const goal = await ReadingGoal.findById(req.params.goalId);
    if (!goal) return sendNotFound(res, "Goal not found");
    if (goal.user.toString() !== req.userId.toString()) {
      return sendForbidden(res, "Not authorized to access this goal");
    }
    req.goal = goal;
    next();
  } catch (error) {
    res.status(500).json({ code: "SERVER_ERROR", message: error.message });
  }
};
