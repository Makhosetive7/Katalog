import express from "express";
import { getWeeklyInsights, getBookPace } from "../../controller/insights/insightsController.js";
import { protect } from "../../middleware/auth/protect.js";
import { assertBookOwner } from "../../middleware/auth/ownership.js";

const router = express.Router();

router.get("/weekly", protect, getWeeklyInsights);
router.get("/books/:bookId/pace", protect, assertBookOwner, getBookPace);

export default router;
