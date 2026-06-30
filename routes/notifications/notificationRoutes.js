import express from "express";
import { previewNudges, triggerNudgeEmail } from "../../service/notificationService/readingNudges.js";
import { protect } from "../../middleware/auth/protect.js";

const router = express.Router();

router.get("/nudges/preview", protect, previewNudges);
router.post("/nudges/send", protect, triggerNudgeEmail);

export default router;
