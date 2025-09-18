import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../../controller/user/authController.js";
import { protect } from "../../middleware/auth/authMiddleware.js";
import { validateProfileUpdate } from "../../middleware/validation/validationMiddleware.js";

const router = express.Router();

router.get("/myProfile", protect, getProfile);
router.put("/updateProfile", protect, validateProfileUpdate, updateProfile);
router.put("/change-password", protect, changePassword);

export default router;
