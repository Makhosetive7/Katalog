import express from "express";
import { getReadingTimeline } from "../../controller/book/timeline/timelineController.js";
import { protect } from "../../middleware/auth/protect.js";

const router = express.Router();

router.get("/timeline", protect, getReadingTimeline);

export default router;
