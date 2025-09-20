import express from "express";
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBookByStatus,
  getBookStatistics,
  searchBooks,
  getRecentBooks,
  updateReadingProgress,
  getAllBooksProgress,
  getProgressAnalytics,
} from "../../controller/book/books/bookController.js";

const router = express.Router();

router.get("/", getAllBooks);
router.get("/search", searchBooks);
router.get("/recentAddedBooks", getRecentBooks);
router.get("/bookStatus/:status", getBookByStatus);
router.get("/getBookById/:id", getBookById);
router.get("/:bookId/statistics", getBookStatistics);

router.post("/createBook", createBook);
router.put("/updateBook/:id", updateBook);
router.delete("/deleteBook/:id", deleteBook);

router.put("/:id/progress", updateReadingProgress);
router.get("/progress/dashboard", getAllBooksProgress);
router.get("/:id/analytics", getProgressAnalytics);

export default router;
