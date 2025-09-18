import express from "express";
import {
  register,
  login,
  logout,
} from "../../controller/user/authController.js";
import { authLimiter } from "../../middleware/rateLimiting/rateLimiting.js";

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);  
router.post("/logout", logout);

export default router;
