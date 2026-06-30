import express from "express";
import { searchOpenLibrary } from "../../controller/discovery/discoveryController.js";
import { protect } from "../../middleware/auth/protect.js";

const router = express.Router();

router.get("/books", protect, searchOpenLibrary);

export default router;
