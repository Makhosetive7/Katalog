import express from "express";
import {
  createTvShow,
  deleteTvShow,
  getAllShows,
  getAllTVShowProgress,
  getTvShowById,
  getTvShowByStatus,
  getTVShowProgressAnalytics,
  getTVShowProgressById,
  getTVShowStatistics,
  searchTvShows,
  updateTVShowProgress
} from "../../controller/tvShow/tvShowController.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TVShow:
 *       type: object
 *       required:
 *         - title
 *         - director
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the TV show
 *         title:
 *           type: string
 *           description: The title of the TV show
 *         director:
 *           type: string
 *           description: The TV show director
 *         cast:
 *           type: array
 *           items:
 *             type: string
 *           description: Main cast members
 *         totalSeasons:
 *           type: number
 *           description: Total number of seasons
 *         totalEpisodes:
 *           type: number
 *           description: Total number of episodes
 *         currentSeason:
 *           type: number
 *           description: Current season being watched
 *         currentEpisode:
 *           type: number
 *           description: Current episode being watched
 *         duration:
 *           type: number
 *           description: Episode duration in minutes
 *         status:
 *           type: string
 *           enum: [Planned, In-Progress, Completed, Dropped]
 *           default: Planned
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 10
 *           default: 0
 *         notes:
 *           type: string
 *           description: Personal notes about the TV show
 *         user:
 *           type: string
 *           description: The ID of the user who owns this TV show
 *         timeline:
 *           type: object
 *           properties:
 *             startedAt:
 *               type: string
 *               format: date-time
 *             completedAt:
 *               type: string
 *               format: date-time
 *             timeSpent:
 *               type: number
 *               description: Total time spent in hours
 *         completionPercentage:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           default: 0
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
 *   name: TVShows
 *   description: TV Show management API
 */

/**
 * @swagger
 * /api/tvshows:
 *   get:
 *     summary: Get all TV shows with filtering
 *     tags: [TVShows]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: director
 *         schema:
 *           type: string
 *         description: Filter by director
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Planned, In-Progress, Completed, Dropped]
 *         description: Filter by TV show status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, rating, createdAt, currentSeason]
 *           default: title
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of TV shows retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TVShow'
 *       500:
 *         description: Server error
 */
router.get("/", getAllShows);

/**
 * @swagger
 * /api/tvshows/search:
 *   get:
 *     summary: Search TV shows by title, director, or cast
 *     tags: [TVShows]
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
 *                 tvShows:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TVShow'
 *       400:
 *         description: Search query too short
 *       500:
 *         description: Server error
 */
router.get("/search", searchTvShows);

/**
 * @swagger
 * /api/tvshows/statistics:
 *   get:
 *     summary: Get TV shows statistics and analytics
 *     tags: [TVShows]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: TV shows statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTVShows:
 *                   type: integer
 *                 totalSeasons:
 *                   type: integer
 *                 totalEpisodes:
 *                   type: integer
 *                 totalWatchTimeHours:
 *                   type: number
 *                 averageRating:
 *                   type: number
 *                 statusCounts:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                 directorCounts:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *       500:
 *         description: Server error
 */
router.get("/statistics", getTVShowStatistics);

/**
 * @swagger
 * /api/tvshows/tvShowStatus/{status}:
 *   get:
 *     summary: Get TV shows by specific status
 *     tags: [TVShows]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Planned, In-Progress, Completed, Dropped]
 *         description: TV show status to filter by
 *     responses:
 *       200:
 *         description: TV shows with the specified status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 tvShows:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TVShow'
 *       400:
 *         description: Invalid status value
 *       500:
 *         description: Server error
 */
router.get("/tvShowStatus/:status", getTvShowByStatus);

/**
 * @swagger
 * /api/tvshows/progress/dashboard:
 *   get:
 *     summary: Get progress data for all TV shows (dashboard view)
 *     tags: [TVShows]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: TV show progress data for dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tvShows:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       completionPercentage:
 *                         type: number
 *                       status:
 *                         type: string
 *                       currentSeason:
 *                         type: number
 *                       currentEpisode:
 *                         type: number
 *                       totalSeasons:
 *                         type: number
 *                       totalEpisodes:
 *                         type: number
 *                 statistics:
 *                   type: object
 *                   properties:
 *                     totalTVShows:
 *                       type: integer
 *                     completedTVShows:
 *                       type: integer
 *                     inProgressTVShows:
 *                       type: integer
 *                     averageCompletion:
 *                       type: number
 *       500:
 *         description: Server error
 */
router.get("/progress/dashboard", getAllTVShowProgress);

/**
 * @swagger
 * /api/tvshows/getTvShowById/{id}:
 *   get:
 *     summary: Get a specific TV show by ID
 *     tags: [TVShows]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: TV show ID
 *     responses:
 *       200:
 *         description: TV show details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TVShow'
 *       404:
 *         description: TV show not found
 *       500:
 *         description: Server error
 */
router.get("/getTvShowById/:id", getTvShowById);

/**
 * @swagger
 * /api/tvshows/getTVShowProgressById/{id}:
 *   get:
 *     summary: Get progress data for a specific TV show
 *     tags: [TVShows]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: TV show ID
 *     responses:
 *       200:
 *         description: TV show progress data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 progress:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     currentSeason:
 *                       type: number
 *                     currentEpisode:
 *                       type: number
 *                     totalSeasons:
 *                       type: number
 *                     totalEpisodes:
 *                       type: number
 *                     completionPercentage:
 *                       type: number
 *                     status:
 *                       type: string
 *                     director:
 *                       type: string
 *                     cast:
 *                       type: array
 *                       items:
 *                         type: string
 *                     episodeDuration:
 *                       type: number
 *                     metric:
 *                       type: string
 *       404:
 *         description: TV show not found
 *       500:
 *         description: Server error
 */
router.get("/getTVShowProgressById/:id", getTVShowProgressById);

/**
 * @swagger
 * /api/tvshows/getTVShowProgressAnalytics/{id}:
 *   get:
 *     summary: Get detailed progress analytics for a specific TV show
 *     tags: [TVShows]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: TV show ID
 *     responses:
 *       200:
 *         description: TV show progress analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tvShowTitle:
 *                   type: string
 *                 director:
 *                   type: string
 *                 cast:
 *                   type: array
 *                   items:
 *                     type: string
 *                 status:
 *                   type: string
 *                 completionPercentage:
 *                   type: number
 *                 seasonProgress:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: number
 *                     total:
 *                       type: number
 *                     percentage:
 *                       type: number
 *                 episodeProgress:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: number
 *                     total:
 *                       type: number
 *                     percentage:
 *                       type: number
 *                 episodeDuration:
 *                   type: number
 *                 recommendedMetric:
 *                   type: string
 *       404:
 *         description: TV show not found
 *       500:
 *         description: Server error
 */
router.get("/getTVShowProgressAnalytics/:id", getTVShowProgressAnalytics);

/**
 * @swagger
 * /api/tvshows/createTvShow:
 *   post:
 *     summary: Create a new TV show
 *     tags: [TVShows]
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
 *               - director
 *             properties:
 *               title:
 *                 type: string
 *               director:
 *                 type: string
 *               cast:
 *                 type: array
 *                 items:
 *                   type: string
 *               totalSeasons:
 *                 type: number
 *               totalEpisodes:
 *                 type: number
 *               duration:
 *                 type: number
 *                 description: Episode duration in minutes
 *               status:
 *                 type: string
 *                 enum: [Planned, In-Progress, Completed, Dropped]
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 10
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: TV show created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 tvShow:
 *                   $ref: '#/components/schemas/TVShow'
 *       400:
 *         description: Validation error or missing required fields
 *       500:
 *         description: Server error
 */
router.post("/createTvShow", createTvShow);

/**
 * @swagger
 * /api/tvshows/updateTVShowProgress/{id}:
 *   patch:
 *     summary: Update TV show progress (season, episode, status)
 *     tags: [TVShows]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: TV show ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentSeason:
 *                 type: number
 *                 description: Current season being watched
 *               currentEpisode:
 *                 type: number
 *                 description: Current episode being watched
 *               status:
 *                 type: string
 *                 enum: [Planned, In-Progress, Completed, Dropped]
 *     responses:
 *       200:
 *         description: TV show progress updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 tvShow:
 *                   $ref: '#/components/schemas/TVShow'
 *                 completionPercentage:
 *                   type: number
 *       400:
 *         description: Invalid progress data
 *       404:
 *         description: TV show not found
 *       500:
 *         description: Server error
 */
router.patch("/updateTVShowProgress/:id", updateTVShowProgress);

/**
 * @swagger
 * /api/tvshows/deleteTvShow/{id}:
 *   delete:
 *     summary: Delete a TV show
 *     tags: [TVShows]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: TV show ID to delete
 *     responses:
 *       200:
 *         description: TV show deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: TV show not found
 *       500:
 *         description: Server error
 */
router.delete("/deleteTvShow/:id", deleteTvShow);

export default router;