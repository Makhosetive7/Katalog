import Book from "../../../model/book.js";
import ReadingSession from "../../../model/readingSession.js";
import mongoose from "mongoose";

export const getAllBooksProgress = async (req, res) => {
  try {
     const userId = req.user.id;

    const books = await Book.find(
      {
          user: userId,
        status: { $in: ["In-Progress", "Completed", "Dropped"] },
      },
      {
        title: 1,
        author: 1,
        genre: 1,
        status: 1,
        pages: 1,
        chapters: 1,
        startedAt: 1,
        DateCompleted: 1,
      }
    ).sort({ title: 1 });

    // all book reading sessions
    const bookIds = books.map((book) => book._id);
    const readingSessions = await ReadingSession.find(
      {
         user: userId,
        book: { $in: bookIds },
      },
      { book: 1, pagesRead: 1, chaptersRead: 1, date: 1 }
    );

    // each book progress calculation
    const bookProgressMap = {};
    readingSessions.forEach((session) => {
      if (!bookProgressMap[session.book]) {
        bookProgressMap[session.book] = { pagesRead: 0, chaptersRead: 0 };
      }
      bookProgressMap[session.book].pagesRead += session.pagesRead;
      bookProgressMap[session.book].chaptersRead += session.chaptersRead;
    });

    // book progress data
    const progressData = books
      .map((book) => {
        const progress = bookProgressMap[book._id] || {
          pagesRead: 0,
          chaptersRead: 0,
        };
        const pagePercentage =
          book.pages > 0
            ? Math.round((progress.pagesRead / book.pages) * 100)
            : 0;
        const chapterPercentage =
          book.chapters > 0
            ? Math.round((progress.chaptersRead / book.chapters) * 100)
            : 0;
        const completionPercentage = Math.max(
          pagePercentage,
          chapterPercentage
        );

        return {
          id: book._id,
          title: book.title,
          author: book.author,
          genre: book.genre,
          completionPercentage,
          status: book.status,
          pages: {
            current: progress.pagesRead,
            total: book.pages,
          },
          chapters: {
            current: progress.chaptersRead,
            total: book.chapters,
          },
          color: book.status === "Completed" ? "#4caf50" : "#2196f3",
        };
      })
      .sort((a, b) => b.completionPercentage - a.completionPercentage);

    const totalBooks = books.length;
    const completedBooks = books.filter((b) => b.status === "Completed").length;
    const averageCompletion =
      totalBooks > 0
        ? Math.round(
            progressData.reduce(
              (sum, book) => sum + book.completionPercentage,
              0
            ) / totalBooks
          )
        : 0;

    //reading timeline aggregation
    const timelineMap = {};
    readingSessions.forEach((session) => {
      const dateKey = session.date.toISOString().split("T")[0];
      if (!timelineMap[dateKey]) {
        timelineMap[dateKey] = { pagesRead: 0, booksWorkedOn: new Set() };
      }
      timelineMap[dateKey].pagesRead += session.pagesRead;
      timelineMap[dateKey].booksWorkedOn.add(session.book.toString());
    });

    const readingTimeline = Object.entries(timelineMap)
      .map(([date, data]) => ({
        date,
        pagesRead: data.pagesRead,
        booksWorkedOn: data.booksWorkedOn.size,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // genre breakdown
    const genreMap = {};
    books.forEach((book) => {
      const genres = Array.isArray(book.genre)
        ? book.genre
        : [book.genre || "Unknown"];
      const progress = bookProgressMap[book._id] || { pagesRead: 0 };

      genres.forEach((g) => {
        if (!genreMap[g])
          genreMap[g] = { books: 0, pages: 0, completionSum: 0 };
        genreMap[g].books += 1;
        genreMap[g].pages += book.pages || 0;

        const bookCompletion =
          book.pages > 0
            ? Math.round((progress.pagesRead / book.pages) * 100)
            : 0;
        genreMap[g].completionSum += bookCompletion;
      });
    });

    const genreBreakdown = Object.entries(genreMap).map(([genre, data]) => ({
      genre,
      books: data.books,
      pages: data.pages,
      completion:
        data.books > 0 ? Math.round(data.completionSum / data.books) : 0,
    }));

    const totalPagesRead = progressData.reduce(
      (sum, book) => sum + book.pages.current,
      0
    );
    const daysTracked = readingTimeline.length || 1;
    const pagesPerDay = Math.round(totalPagesRead / daysTracked);
    const pagesPerWeek = pagesPerDay * 7;

    const remainingPages = progressData.reduce(
      (sum, book) => sum + (book.pages.total - book.pages.current),
      0
    );
    const estimatedCompletion =
      pagesPerDay > 0
        ? new Date(Date.now() + (remainingPages / pagesPerDay) * 86400000)
            .toISOString()
            .split("T")[0]
        : null;

    const readingSpeed = {
      pagesPerDay,
      pagesPerWeek,
      estimatedCompletion,
      totalPagesRead,
      daysTracked,
    };

    const yearlyTarget = 50;
    const goals = {
      yearlyTarget,
      currentProgress: completedBooks,
      onTrack:
        completedBooks >= (new Date().getMonth() + 1) * (yearlyTarget / 12),
      progressPercentage: Math.round((completedBooks / yearlyTarget) * 100),
    };

    res.json({
      books: progressData,
      statistics: {
        totalBooks,
        completedBooks,
        inProgressBooks: totalBooks - completedBooks,
        averageCompletion,
        completionRate:
          totalBooks > 0 ? Math.round((completedBooks / totalBooks) * 100) : 0,
        totalPagesRead,
      },
      readingTimeline,
      genreBreakdown,
      readingSpeed,
      goals,
    });
  } catch (error) {
    console.error("Failed getting all books progress:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
