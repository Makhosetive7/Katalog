import rateLimit from "express-rate-limit";

// Password reset limiter
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 3, 
  message: "Too many password reset attempts, please try again later",
});
