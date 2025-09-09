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
  getChapterNotes,
  getAllBooksProgress,
  getProgressAnalytics
} from "../../controller/Books/booksController.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - genre
 *         - pages
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the book
 *         title:
 *           type: string
 *           description: The title of the book
 *         author:
 *           type: string
 *           description: The author of the book
 *         genre:
 *           type: string
 *           description: The genre of the book
 *         pages:
 *           type: number
 *           description: The number of pages
 *         status:
 *           type: string
 *           enum: [Want to Read, Reading, Completed]
 *           default: Want to Read
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *           default: 0
 *         notes:
 *           type: string
 *           description: Personal notes about the book
 *         user:
 *           type: string
 *           description: The ID of the user who owns this book
 *         dateStarted:
 *           type: string
 *           format: date-time
 *         dateCompleted:
 *           type: string
 *           format: date-time
 *         totalTime:
 *           type: number
 *           description: Total reading time in hours
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book management API
 */

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books with filtering and pagination
 *     tags: [Books]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Want to Read, Reading, Completed]
 *         description: Filter by reading status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of books retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get("/", getAllBooks);

/**
 * @swagger
 * /api/books/search:
 *   get:
 *     summary: Search books by title, author, or genre
 *     tags: [Books]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query (min 2 characters)
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 query:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *       400:
 *         description: Search query too short
 *       500:
 *         description: Server error
 */
router.get("/search", searchBooks);

/**
 * @swagger
 * /api/books/statistics:
 *   get:
 *     summary: Get books statistics and analytics
 *     tags: [Books]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Books statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalBooks:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 averageRating:
 *                   type: number
 *                 statusCounts:
 *                   type: object
 *                   properties:
 *                     "Want to Read":
 *                       type: integer
 *                     "Reading":
 *                       type: integer
 *                     "Completed":
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get("/statistics", getBookStatistics);

/**
 * @swagger
 * /api/books/recentAddedBooks:
 *   get:
 *     summary: Get recently added books
 *     tags: [Books]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of recent books to retrieve
 *     responses:
 *       200:
 *         description: List of recently added books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         description: Server error
 */
router.get("/recentAddedBooks", getRecentBooks);

/**
 * @swagger
 * /api/books/BookStatus/{status}:
 *   get:
 *     summary: Get books by specific status
 *     tags: [Books]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Want to Read, Reading, Completed]
 *         description: Book status to filter by
 *     responses:
 *       200:
 *         description: Books with the specified status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *       400:
 *         description: Invalid status value
 *       500:
 *         description: Server error
 */
router.get("/bookStatus/:status", getBookByStatus);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get a specific book by ID
 *     tags: [Books]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
router.get("/getBookById/:id", getBookById);

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - genre
 *               - pages
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               genre:
 *                 type: string
 *               pages:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [Want to Read, Reading, Completed]
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 book:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         description: Validation error or missing required fields
 *       500:
 *         description: Server error
 */
router.post("/createBook", createBook);

/**
 * @swagger
 * /api/books/updateBook/{id}:
 *   put:
 *     summary: Update a book's details
 *     tags: [Books]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               genre:
 *                 type: string
 *               pages:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [Want to Read, Reading, Completed]
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 book:
 *                   $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
router.put("/updateBook/:id", updateBook);

/**
 * @swagger
 * /api/books/deleteBook/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID to delete
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
router.delete("/deleteBook/:id", deleteBook);
router.put('/:id/progress', updateReadingProgress);
router.get('/:id/notes', getChapterNotes);
router.get('/:id/analytics', getProgressAnalytics);
router.get('/progress/dashboard', getAllBooksProgress);

export default router;
