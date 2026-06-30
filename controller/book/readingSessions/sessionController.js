import ReadingSession from "../../../model/readingSession.js";
import Book from "../../../model/book.js";
import { updateReadingStreak } from "../readingStreaks/updateReadingStreak.js";
import { logUserReadingActivity } from "../readingActivity/recordReadingActivity.js";
import { calculateGoalProgress } from "../readingGoals/calculateReadingProgress.js";
import ReadingGoal from "../../../model/readingGoals.js";
import Achievement from "../../../model/readingAchiervements.js";
import ReadingStreak from "../../../model/readingStreak.js";
import { buildRichProgressPayload } from "../books/buildRichProgressPayload.js";

export const getBookSessions = async (req, res) => {
  try {
    const sessions = await ReadingSession.find({
      user: req.userId,
      book: req.params.bookId,
    }).sort({ date: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ code: "SERVER_ERROR", message: error.message });
  }
};

export const createReadingSession = async (req, res) => {
  try {
    const { pagesRead = 0, chaptersRead = 0, readingTime = 0, mood, date } = req.body;
    const bookId = req.params.bookId;
    const userId = req.userId;
    const requestStartedAt = new Date();

    const book = req.book || (await Book.findById(bookId));
    if (!book) return res.status(404).json({ code: "NOT_FOUND", message: "Book not found" });

    const previousPage = book.currentPage ?? 0;

    if (pagesRead > 0) {
      book.currentPage = Math.min((book.currentPage ?? 0) + pagesRead, book.pages || Infinity);
    }
    if (chaptersRead > 0) {
      book.currentChapter = Math.min(
        (book.currentChapter ?? 0) + chaptersRead,
        book.chapters || Infinity
      );
    }

    const pageCompletion = book.pages > 0 ? Math.round((book.currentPage / book.pages) * 100) : 0;
    const chapterCompletion =
      book.chapters > 0 ? Math.round((book.currentChapter / book.chapters) * 100) : 0;
    book.completionPercentage = Math.min(Math.max(pageCompletion, chapterCompletion), 100);

    if (!book.timeline) book.timeline = {};
    if (book.completionPercentage >= 100) {
      book.status = "Completed";
      book.timeline.completedAt = new Date();
    } else if (book.completionPercentage > 0 && book.status === "Planned") {
      book.status = "In-Progress";
      if (!book.timeline.startedAt) book.timeline.startedAt = new Date();
    }

    if (readingTime > 0) {
      book.timeline.timeSpent = (book.timeline.timeSpent || 0) + readingTime / 60;
    }

    await book.save();

    const session = await ReadingSession.create({
      user: userId,
      book: bookId,
      pagesRead,
      chaptersRead,
      readingTime,
      mood,
      date: date ? new Date(date) : new Date(),
    });

    await logUserReadingActivity(userId, {
      pagesDelta: pagesRead,
      progressUpdate: pagesRead > 0 || chaptersRead > 0,
      bookStarted: book.status === "In-Progress",
      bookCompleted: book.status === "Completed" && book.completionPercentage >= 100,
    });

    await updateReadingStreak(userId);

    const activeGoals = await ReadingGoal.find({ user: userId, book: bookId, completed: false });
    for (const goal of activeGoals) {
      await calculateGoalProgress(goal._id);
    }

    const rich = await buildRichProgressPayload({
      userId,
      book,
      previousPage,
      requestStartedAt,
      activeGoals,
    });

    res.status(201).json({
      message: "Reading session logged",
      session,
      ...rich,
    });
  } catch (error) {
    res.status(500).json({ code: "SERVER_ERROR", message: error.message });
  }
};

export const deleteReadingSession = async (req, res) => {
  try {
    const session = await ReadingSession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ code: "NOT_FOUND", message: "Session not found" });
    if (session.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ code: "FORBIDDEN", message: "Not authorized" });
    }

    await session.deleteOne();
    res.json({ message: "Session deleted" });
  } catch (error) {
    res.status(500).json({ code: "SERVER_ERROR", message: error.message });
  }
};
