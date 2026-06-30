import express from "express";
import { getPublicProfile } from "../../controller/users/publicProfileController.js";

const router = express.Router();

router.get("/:username/public", getPublicProfile);

export default router;
