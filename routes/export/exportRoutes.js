import express from "express";
import { exportBooksCsv, exportLibraryJson } from "../../controller/export/exportController.js";
import { protect } from "../../middleware/auth/protect.js";

const router = express.Router();

router.get("/books.csv", protect, exportBooksCsv);
router.get("/library.json", protect, exportLibraryJson);

export default router;
