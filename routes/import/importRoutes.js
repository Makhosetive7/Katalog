import express from "express";
import { previewImport, importBooks } from "../../controller/import/importController.js";
import { protect } from "../../middleware/auth/protect.js";

const router = express.Router();

router.post("/preview", protect, previewImport);
router.post("/books", protect, importBooks);

export default router;
