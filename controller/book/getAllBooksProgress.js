import Book from "../../model/book.js"

export const getAllBooksProgress = async (req, res) => {
  try {
    const books = await Book.find(
      { status: { $in: ['In-Progress', 'Completed', 'Dropped'] } },
      { title: 1, completionPercentage: 1, status: 1, pages: 1, currentPage: 1 }
    ).sort({ completionPercentage: -1 });

    const progressData = books.map(book => ({
      id: book._id,
      title: book.title,
      completionPercentage: book.completionPercentage,
      status: book.status,
      pages: {
        current: book.currentPage,
        total: book.pages
      },
      color: book.status === 'Completed' ? '#4caf50' : '#2196f3' 
    }));

    const totalBooks = books.length;
    const completedBooks = books.filter(b => b.status === 'Completed').length;
    const averageCompletion = totalBooks > 0 
      ? Math.round(books.reduce((sum, book) => sum + book.completionPercentage, 0) / totalBooks)
      : 0;

    res.json({
      books: progressData,
      statistics: {
        totalBooks,
        completedBooks,
        inProgressBooks: totalBooks - completedBooks,
        averageCompletion,
        completionRate: totalBooks > 0 ? Math.round((completedBooks / totalBooks) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Failed getting all books progress:', error.message);
    res.status(500).json({ error: "Server error"});
  }
};