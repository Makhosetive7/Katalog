import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5,
  message: "Too many authentication attempts, please try again later",
});