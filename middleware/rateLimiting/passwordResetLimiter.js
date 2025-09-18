import rateLimit from "express-rate-limit";

// Password reset limiter
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per hour
  message: "Too many password reset attempts, please try again later",
});
