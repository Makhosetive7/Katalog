import { createBook } from "./createBook.js";
import { deleteBook } from "./deleteBook.js";
import { getAllBooks } from "./getAllBooks.js";
import { getAllBooksProgress } from "./getAllBooksProgress.js";
import { getBookById } from "./getBookById.js";
import { getBookByStatus } from "./getBookByStatus.js";
import { getBookGoals } from "../readingGoals/getBookGoals.js";
import { getBookStatistics } from "./getBookStatistics.js";
import { getProgressAnalytics } from "./getProgressAnalytics.js";
import { getRecentBooks } from "./recentAddedBooks.js";
import { searchBooks } from "./searchBooks.js ";
import { updateBook } from "./updateBook.js";
import { logReadingProgress } from "./updateReadingProgress.js";
import {getReadingStatistics} from "./getReadingStatistics.js";

export {
  getBookStatistics,
  createBook,
  deleteBook,
  getBookById,
  getBookByStatus,
  getRecentBooks,
  searchBooks,
  updateBook,
  getAllBooks,
  logReadingProgress,
  getAllBooksProgress,
  getProgressAnalytics,
  getBookGoals,
  getReadingStatistics
};
