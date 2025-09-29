import Book from "../../../model/book.js";
import ChapterNote from "../../../model/chapterNote.js";
import ReadingGoal from "../../../model/readingGoals.js";
import ReadingChallenge from "../../../model/readingChallange.js";
import { updateReadingStreak } from "../readingStreaks/updateReadingStreak.js";
import { checkBookAchievements } from "../readingAchievements/checkBookAchievements.js";
import { checkChallengeAchievement } from "../readingChallange/checkChallengeAchievement.js";
import { calculateGoalProgress } from "../readingGoals/calculateReadingProgress.js";

export const logReadingProgress = async (req, res) => {
  try {
    const { currentPage, currentChapter, note, status } = req.body;
    const bookId = req.params.id;
    const userId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // 🔹 Update pages
    if (currentPage !== undefined) {
      if (currentPage > book.pages) {
        return res.status(400).json({ message: "Current page cannot exceed total pages" });
      }
      book.currentPage = Math.max(currentPage, book.currentPage);
    }

    // 🔹 Update chapters
    if (currentChapter !== undefined) {
      if (currentChapter > book.chapters) {
        return res.status(400).json({ message: "Current chapter cannot exceed total chapters" });
      }
      book.currentChapter = Math.max(currentChapter, book.currentChapter);
    }

    // 🔹 Chapter notes
    if (note && currentChapter !== undefined) {
      const existingNote = await ChapterNote.findOne({ user: userId, book: bookId, chapter: currentChapter });
      if (existingNote) {
        existingNote.note = note;
        existingNote.updatedAt = new Date();
        await existingNote.save();
      } else {
        await new ChapterNote({
          user: userId,
          book: bookId,
          chapter: currentChapter,
          note,
          isPublic: false,
        }).save();
      }
    }

    // 🔹 Completion %
    const pageCompletion = book.pages > 0 ? Math.round((book.currentPage / book.pages) * 100) : 0;
    const chapterCompletion = book.chapters > 0 ? Math.round((book.currentChapter / book.chapters) * 100) : 0;
    book.completionPercentage = Math.min(Math.max(pageCompletion, chapterCompletion), 100);

    // 🔹 Ensure timeline exists
    if (!book.timeline) book.timeline = {};

    // 🔹 Update status
    if (status) {
      book.status = status;
    } else {
      if (book.completionPercentage >= 100) {
        book.status = "Completed";
        book.timeline.completedAt = new Date();
        await checkBookAchievements(userId, bookId);

        // Update reading challenge
        const challenge = await ReadingChallenge.findOne({ user: userId, year: new Date().getFullYear() });
        if (challenge && !challenge.books.includes(bookId)) {
          challenge.books.push(bookId);
          challenge.currentCount += 1;
          if (challenge.currentCount >= challenge.goal) {
            challenge.completed = true;
            challenge.completedDate = new Date();
            await checkChallengeAchievement(userId, challenge._id);
          }
          await challenge.save();
        }
      } else if (book.completionPercentage > 0 && book.status === "Planned") {
        book.status = "In-Progress";
        if (!book.timeline.startedAt) book.timeline.startedAt = new Date();
      }
    }

    // 🔹 Update reading velocity
    if (book.currentPage > 0) {
      const daysSinceStart = Math.max(
        1,
        Math.ceil((Date.now() - new Date(book.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      );
      book.readingVelocity.avgPagesPerDay = (book.currentPage / daysSinceStart).toFixed(1);
      book.readingVelocity.lastUpdated = new Date();
    }

    await book.save();

    // 🔹 Update streak
    await updateReadingStreak(userId);

    // 🔹 Update active goals
    const activeGoals = await ReadingGoal.find({ user: userId, book: bookId, completed: false });
    for (const goal of activeGoals) {
      await calculateGoalProgress(goal._id);
    }

    // 🔹 Response
    res.json({
      message: "Reading progress logged successfully",
      book: {
        id: book._id,
        title: book.title,
        author: book.author,
        currentPage: book.currentPage,
        currentChapter: book.currentChapter,
        status: book.status,
        completionPercentage: book.completionPercentage,
        velocity: book.readingVelocity,
      },
      updatedGoals: activeGoals.map((g) => ({
        id: g._id,
        progress: g.progress,
        target: g.target,
        completed: g.completed,
      })),
    });
  } catch (error) {
    console.error("Failed logging reading progress:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
