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
  logReadingProgress,
  getAllBooksProgress,
  getProgressAnalytics,
  getReadingStatistics,
  getReadingActivityHeatmap,
} from "../../controller/book/books/bookController.js";
import { protect } from "../../middleware/auth/protect.js";
import { assertBookOwner } from "../../middleware/auth/ownership.js";

const router = express.Router();

// Static routes first (order matters)
router.get("/search", protect, searchBooks);
router.get("/recent", protect, getRecentBooks);
router.get("/recentAddedBooks", protect, getRecentBooks);
router.get("/statistics", protect, getReadingStatistics);
router.get("/reading-stats", protect, getReadingStatistics);
router.get("/analytics", protect, getReadingStatistics);
router.get("/progress/dashboard", protect, getAllBooksProgress);
router.get("/activity/heatmap", protect, getReadingActivityHeatmap);
router.get("/bookStatus/:status", protect, getBookByStatus);

router.get("/", protect, getAllBooks);
router.post("/", protect, createBook);
router.post("/createBook", protect, createBook);

router.get("/getBookById/:id", protect, assertBookOwner, getBookById);
router.get("/:id", protect, assertBookOwner, getBookById);

router.put("/updateBook/:id", protect, assertBookOwner, updateBook);
router.put("/:id", protect, assertBookOwner, updateBook);

router.delete("/deleteBook/:id", protect, assertBookOwner, deleteBook);
router.delete("/:id", protect, assertBookOwner, deleteBook);

router.put("/:id/progress", protect, assertBookOwner, logReadingProgress);

router.get("/:bookId/statistics", protect, assertBookOwner, getBookStatistics);
router.get("/:id/analytics", protect, assertBookOwner, getProgressAnalytics);

export default router;
