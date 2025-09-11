import Book from "../../model/book.js";
import mongoose from "mongoose";

export const getAllBooksProgress = async (req, res) => {
  try {
    const books = await Book.find(
      { status: { $in: ["In-Progress", "Completed", "Dropped"] } },
      {
        title: 1,
        author: 1,
        genre: 1,
        completionPercentage: 1,
        status: 1,
        pages: 1,
        currentPage: 1,
        chapters: 1,
        readingTimeline: 1,
      }
    ).sort({ completionPercentage: -1 });

    // --- Books Progress Data ---
    const progressData = books.map((book) => ({
      id: book._id,
      title: book.title,
      author: book.author,
      genre: book.genre,
      completionPercentage: book.completionPercentage,
      status: book.status,
      pages: {
        current: book.currentPage,
        total: book.pages,
      },
      chapters: {
        current: book.currentChapter,
        total: book.chapters,
      },
      color: book.status === "Completed" ? "#4caf50" : "#2196f3",
    }));

    // --- Statistics ---
    const totalBooks = books.length;
    const completedBooks = books.filter((b) => b.status === "Completed").length;
    const averageCompletion =
      totalBooks > 0
        ? Math.round(
            books.reduce((sum, book) => sum + book.completionPercentage, 0) /
              totalBooks
          )
        : 0;

    // --- Reading Timeline Aggregation ---
    const timelineMap = {};
    books.forEach((book) => {
      book.readingTimeline.forEach((entry) => {
        const dateKey = entry.date.toISOString().split("T")[0];
        if (!timelineMap[dateKey]) {
          timelineMap[dateKey] = { pagesRead: 0, booksWorkedOn: new Set() };
        }
        timelineMap[dateKey].pagesRead += entry.pagesRead;
        timelineMap[dateKey].booksWorkedOn.add(book._id.toString());
      });
    });

    const readingTimeline = Object.entries(timelineMap)
      .map(([date, data]) => ({
        date,
        pagesRead: data.pagesRead,
        booksWorkedOn: data.booksWorkedOn.size,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // --- Genre Breakdown ---
    const genreMap = {};
    books.forEach((book) => {
      const genres = Array.isArray(book.genre) ? book.genre : [book.genre || "Unknown"];
      genres.forEach((g) => {
        if (!genreMap[g]) genreMap[g] = { books: 0, pages: 0, completionSum: 0 };
        genreMap[g].books += 1;
        genreMap[g].pages += book.pages || 0;
        genreMap[g].completionSum += book.completionPercentage || 0;
      });
    });

    const genreBreakdown = Object.entries(genreMap).map(([genre, data]) => ({
      genre,
      books: data.books,
      pages: data.pages,
      completion: Math.round(data.completionSum / data.books),
    }));

    // --- Reading Speed ---
    const totalPagesRead = books.reduce((sum, b) => sum + (b.currentPage || 0), 0);
    const daysTracked = readingTimeline.length || 1;
    const pagesPerDay = Math.round(totalPagesRead / daysTracked);
    const pagesPerWeek = pagesPerDay * 7;

    const remainingPages = books.reduce(
      (sum, b) => sum + ((b.pages || 0) - (b.currentPage || 0)),
      0
    );
    const estimatedCompletion = new Date(
      Date.now() + (remainingPages / (pagesPerDay || 1)) * 86400000
    )
      .toISOString()
      .split("T")[0];

    const readingSpeed = { pagesPerDay, pagesPerWeek, estimatedCompletion };

    // --- Goals (yearly target example) ---
    const yearlyTarget = 50;
    const goals = {
      yearlyTarget,
      currentProgress: completedBooks,
      onTrack:
        completedBooks >= (new Date().getMonth() + 1) * (yearlyTarget / 12),
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
