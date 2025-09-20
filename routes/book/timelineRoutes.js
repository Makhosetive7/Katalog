import express from "express";
import { getReadingTimeline } from "../../controller/book/timeline/timelineController.js";

const router = express.Router();

router.get("/timeline", getReadingTimeline);

export default router;
