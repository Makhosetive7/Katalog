import express from "express";
import {
  createGame,
  deleteGame,
  getAllGameProgress,
  getAllGames,
  getGameByStatus,
  getGameProgressAnalytics,
  getGameProgressById,
  getGamesById,
  getGameStatistics,
  searchGames,
  updateGameProgress
} from "../../controller/game/gamesController.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Game:
 *       type: object
 *       required:
 *         - title
 *         - platform
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the game
 *         title:
 *           type: string
 *           description: The title of the game
 *         platform:
 *           type: array
 *           items:
 *             type: string
 *           description: Platforms the game is available on
 *         developer:
 *           type: string
 *           description: The game developer
 *         publisher:
 *           type: string
 *           description: The game publisher
 *         playtime:
 *           type: number
 *           description: Total hours played
 *         currentLevel:
 *           type: number
 *           description: Current level/progress in the game
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
 *           description: Personal notes about the game
 *         user:
 *           type: string
 *           description: The ID of the user who owns this game
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
 *   name: Games
 *   description: Game management API
 */

/**
 * @swagger
 * /api/games:
 *   get:
 *     summary: Get all games with filtering
 *     tags: [Games]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *         description: Filter by platform (e.g., PC, PlayStation, Xbox)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Planned, In-Progress, Completed, Dropped]
 *         description: Filter by game status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, playtime, rating, createdAt]
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
 *         description: List of games retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Game'
 *       500:
 *         description: Server error
 */
router.get("/", getAllGames);

/**
 * @swagger
 * /api/games/search:
 *   get:
 *     summary: Search games by title, developer, or platform
 *     tags: [Games]
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
 *                 games:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Game'
 *       400:
 *         description: Search query too short
 *       500:
 *         description: Server error
 */
router.get("/search", searchGames);

/**
 * @swagger
 * /api/games/statistics:
 *   get:
 *     summary: Get games statistics and analytics
 *     tags: [Games]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Games statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalGames:
 *                   type: integer
 *                 totalPlaytime:
 *                   type: number
 *                 averageRating:
 *                   type: number
 *                 statusCounts:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                 platformCounts:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *       500:
 *         description: Server error
 */
router.get("/statistics", getGameStatistics);

/**
 * @swagger
 * /api/games/gameStatus/{status}:
 *   get:
 *     summary: Get games by specific status
 *     tags: [Games]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Planned, In-Progress, Completed, Dropped]
 *         description: Game status to filter by
 *     responses:
 *       200:
 *         description: Games with the specified status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 games:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Game'
 *       400:
 *         description: Invalid status value
 *       500:
 *         description: Server error
 */
router.get("/gameStatus/:status", getGameByStatus);

/**
 * @swagger
 * /api/games/progress/dashboard:
 *   get:
 *     summary: Get progress data for all games (dashboard view)
 *     tags: [Games]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Game progress data for dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 games:
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
 *                       playtime:
 *                         type: number
 *                 statistics:
 *                   type: object
 *                   properties:
 *                     totalGames:
 *                       type: integer
 *                     completedGames:
 *                       type: integer
 *                     inProgressGames:
 *                       type: integer
 *                     averageCompletion:
 *                       type: number
 *       500:
 *         description: Server error
 */
router.get("/progress/dashboard", getAllGameProgress);

/**
 * @swagger
 * /api/games/getGameById/{id}:
 *   get:
 *     summary: Get a specific game by ID
 *     tags: [Games]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Game ID
 *     responses:
 *       200:
 *         description: Game details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 *       404:
 *         description: Game not found
 *       500:
 *         description: Server error
 */
router.get("/getGameById/:id", getGamesById);

/**
 * @swagger
 * /api/games/getGameProgressById/{id}:
 *   get:
 *     summary: Get progress data for a specific game
 *     tags: [Games]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Game ID
 *     responses:
 *       200:
 *         description: Game progress data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gameTitle:
 *                   type: string
 *                 platforms:
 *                   type: array
 *                   items:
 *                     type: string
 *                 status:
 *                   type: string
 *                 completionPercentage:
 *                   type: number
 *                 playtime:
 *                   type: object
 *                   properties:
 *                     hours:
 *                       type: number
 *                     formatted:
 *                       type: string
 *                 currentLevel:
 *                   type: number
 *                 progress:
 *                   type: object
 *       404:
 *         description: Game not found
 *       500:
 *         description: Server error
 */
router.get("/getGameProgressById/:id", getGameProgressById);

/**
 * @swagger
 * /api/games/getGameProgressAnalytics/{id}:
 *   get:
 *     summary: Get detailed progress analytics for a specific game
 *     tags: [Games]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Game ID
 *     responses:
 *       200:
 *         description: Game progress analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gameTitle:
 *                   type: string
 *                 completionPercentage:
 *                   type: number
 *                 playtime:
 *                   type: object
 *                   properties:
 *                     hours:
 *                       type: number
 *                     formatted:
 *                       type: string
 *                 currentLevel:
 *                   type: number
 *                 recommendedMetric:
 *                   type: string
 *       404:
 *         description: Game not found
 *       500:
 *         description: Server error
 */
router.get("/getGameProgressAnalytics/:id", getGameProgressAnalytics);

/**
 * @swagger
 * /api/games/createGame:
 *   post:
 *     summary: Create a new game
 *     tags: [Games]
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
 *               - platform
 *             properties:
 *               title:
 *                 type: string
 *               platform:
 *                 type: array
 *                 items:
 *                   type: string
 *               developer:
 *                 type: string
 *               publisher:
 *                 type: string
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
 *         description: Game created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 game:
 *                   $ref: '#/components/schemas/Game'
 *       400:
 *         description: Validation error or missing required fields
 *       500:
 *         description: Server error
 */
router.post("/createGame", createGame);

/**
 * @swagger
 * /api/games/updateGameProgress/{id}:
 *   patch:
 *     summary: Update game progress (playtime, level, status)
 *     tags: [Games]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Game ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               playtime:
 *                 type: number
 *                 description: Total hours played
 *               currentLevel:
 *                 type: number
 *                 description: Current level in the game
 *               status:
 *                 type: string
 *                 enum: [Planned, In-Progress, Completed, Dropped]
 *     responses:
 *       200:
 *         description: Game progress updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 game:
 *                   $ref: '#/components/schemas/Game'
 *                 completionPercentage:
 *                   type: number
 *       400:
 *         description: Invalid progress data
 *       404:
 *         description: Game not found
 *       500:
 *         description: Server error
 */
router.patch("/updateGameProgress/:id", updateGameProgress);

/**
 * @swagger
 * /api/games/deleteGame/{id}:
 *   delete:
 *     summary: Delete a game
 *     tags: [Games]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Game ID to delete
 *     responses:
 *       200:
 *         description: Game deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Game not found
 *       500:
 *         description: Server error
 */
router.delete("/deleteGame/:id", deleteGame);

export default router;