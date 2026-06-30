import express from "express";
import {
  register,
  login,
  logout,
  demoLogIn,
} from "../../controller/user/authController.js";
import {
  getAuthConfig,
  googleAuthStart,
  googleAuthCallback,
} from "../../controller/user/googleAuth.js";
import { authLimiter } from "../../middleware/rateLimiting/rateLimiting.js";
import {
  requireLocalAuth,
  requireDemoAuth,
} from "../../middleware/auth/requireAuthMode.js";

const router = express.Router();

router.get("/config", getAuthConfig);
router.get("/google", googleAuthStart);
router.get("/google/callback", googleAuthCallback);

router.post("/register", authLimiter, requireLocalAuth, register);
router.post("/demo", authLimiter, requireDemoAuth, demoLogIn);
router.post("/login", authLimiter, requireLocalAuth, login);
router.post("/logout", logout);

export default router;
