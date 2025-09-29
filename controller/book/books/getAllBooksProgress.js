import Book from "../../../model/book.js";
import ReadingGoal from "../../../model/readingGoals.js";

export const getAllBooksProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all books for the user
    const books = await Book.find({ user: userId });

    if (!books.length) {
      return res.json({
        books: [],
        statistics: {
          totalBooks: 0,
          completedBooks: 0,
          inProgressBooks: 0,
          averageCompletion: 0,
          completionRate: 0,
          totalPagesRead: 0,
        },
        goals: [],
      });
    }

    // Compute book progress and fetch goals
    const progressData = await Promise.all(
      books.map(async (book) => {
        const pageCompletion =
          book.pages > 0 ? Math.round((book.currentPage / book.pages) * 100) : 0;
        const chapterCompletion =
          book.chapters > 0
            ? Math.round((book.currentChapter / book.chapters) * 100)
            : 0;

        const completionPercentage = Math.min(
          Math.max(pageCompletion, chapterCompletion),
          100
        );

        // fetch goals for this book
        const goals = await ReadingGoal.find({ user: userId, book: book._id });

        return {
          id: book._id,
          title: book.title,
          author: book.author,
          genre: book.genre,
          status: book.status,
          pages: { current: book.currentPage, total: book.pages },
          chapters: { current: book.currentChapter, total: book.chapters },
          completionPercentage,
          goals: goals.map((g) => ({
            type: g.type,
            target: g.target,
            progress: g.progress,
            completed: g.completed,
          })),
        };
      })
    );

    // Aggregate statistics
    const totalBooks = books.length;
    const completedBooks = books.filter((b) => b.status === "Completed").length;
    const totalPagesRead = books.reduce((sum, b) => sum + (b.currentPage || 0), 0);
    const averageCompletion =
      totalBooks > 0
        ? Math.round(
            progressData.reduce((sum, b) => sum + b.completionPercentage, 0) /
              totalBooks
          )
        : 0;

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
    });
  } catch (error) {
    console.error("Failed getting all books progress:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
