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
import { protect } from "../../middleware/auth/protect.js";

const router = express.Router();

router.get("/",protect, getAllBooks);
router.get("/search",protect, searchBooks);
router.get("/recentAddedBooks", getRecentBooks);
router.get("/bookStatus/:status", getBookByStatus);
router.get("/getBookById/:id", protect, getBookById);
router.get("/:bookId/statistics",protect, getBookStatistics);

router.post("/createBook", createBook);
router.put("/updateBook/:id", updateBook);
router.delete("/deleteBook/:id", deleteBook);

router.put("/:id/progress",protect, updateReadingProgress);
router.get("/progress/dashboard", protect, getAllBooksProgress);
router.get("/:id/analytics", getProgressAnalytics);

export default router;
