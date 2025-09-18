import Book from "../../model/book.js";
import ReadingSession from "../../model/readingSession.js";
import ChapterNote from "../../model/chapterNote.js";
import { updateReadingStreak } from "./updateReadingStreak.js";
import { checkBookAchievements } from "./checkBookAchievements.js";
import { checkChallengeAchievement } from "./checkChallengeAchievement.js";
import ReadingChallenge from "../../model/readingChallange.js";

export const updateReadingProgress = async (req, res) => {
  try {
    const { currentPage, currentChapter, note, status } = req.body;
    const bookId = req.params.id;
 //   const userId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    let pagesRead = 0;
    let newReadingSession = null;

    if (currentPage !== undefined) {
      if (currentPage > book.pages) {
        return res.status(400).json({
          message: "Current page cannot exceed total number of pages",
        });
      }

      if (currentPage > book.currentPage) {
        pagesRead = currentPage - book.currentPage;

        newReadingSession = new ReadingSession({
      //    user: userId,
          book: bookId,
          date: new Date(),
          pagesRead: pagesRead,
          chapter: currentChapter || book.currentChapter,
          readingTime: 0,
        });
        await newReadingSession.save();
      }

      book.currentPage = currentPage;
    }

    if (currentChapter !== undefined) {
      if (currentChapter > book.chapters) {
        return res.status(400).json({
          message: "Current chapter cannot exceed total chapters",
        });
      }
      book.currentChapter = currentChapter;
    }

    if (note && currentChapter !== undefined) {
      const existingNote = await ChapterNote.findOne({
    //    user: userId,
        book: bookId,
        chapter: currentChapter,
      });

      if (existingNote) {
        existingNote.note = note;
        existingNote.updatedAt = new Date();
        await existingNote.save();
      } else {
        const newChapterNote = new ChapterNote({
      //    user: userId,
          book: bookId,
          chapter: currentChapter,
          note: note,
          isPublic: false,
        });
        await newChapterNote.save();
      }
    }

    if (book.pages > 0) {
      book.completionPercentage = Math.round(
        (book.currentPage / book.pages) * 100
      );
    } else if (book.chapters > 0) {
      book.completionPercentage = Math.round(
        (book.currentChapter / book.chapters) * 100
      );
    }
    book.completionPercentage = Math.min(book.completionPercentage, 100);

    // NEW: Update reading streak
    await updateReadingStreak(
    //  userId
    );

    if (status) {
      book.status = status;
    } else {
      if (book.completionPercentage >= 100) {
        book.status = "Completed";
        book.timeline.completedAt = new Date();

        // NEW: Check achievements and update challenge
        await checkBookAchievements(
        //  userId,
           bookId);

        const challenge = await ReadingChallenge.findOne({
       //   user: userId,
          year: new Date().getFullYear(),
        });

        if (challenge && !challenge.books.includes(bookId)) {
          challenge.books.push(bookId);
          challenge.currentCount += 1;

          if (challenge.currentCount >= challenge.goal) {
            challenge.completed = true;
            challenge.completedDate = new Date();
            await checkChallengeAchievement(
       //       userId,
               challenge._id);
          }

          await challenge.save();
        }
      } else if (book.completionPercentage > 0 && book.status === "Planned") {
        book.status = "In-Progress";
        if (!book.timeline.startedAt) book.timeline.startedAt = new Date();
      }
    }

    const updatedBook = await book.save();

    res.json({
      message: "Progress updated successfully",
      book: updatedBook,
      completionPercentage: updatedBook.completionPercentage,
      latestSession: newReadingSession,
    });
  } catch (error) {
    console.error("Failed updating reading progress:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
