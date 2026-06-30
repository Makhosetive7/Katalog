import express from "express";
import {
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} from "../../controller/user/authController.js";
import { passwordResetLimiter } from "../../middleware/rateLimiting/rateLimiting.js";

const router = express.Router();

router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password", passwordResetLimiter, resetPassword);

export default router;
