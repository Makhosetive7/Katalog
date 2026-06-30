import express from "express";
import { getRecommendations } from "../../controller/recommendations/recommendationsController.js";
import { protect } from "../../middleware/auth/protect.js";

const router = express.Router();

router.get("/", protect, getRecommendations);

export default router;
