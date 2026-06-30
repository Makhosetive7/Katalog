import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";

import bookRoutes from "./routes/book/bookRoutes.js";
import sessionRoutes from "./routes/book/sessionRoutes.js";
import achievementsRoutes from "./routes/book/achievmentsRoutes.js";
import challengeRoutes from "./routes/book/challengeRoutes.js";
import goalRoutes from "./routes/book/goalRoutes.js";
import notesRoutes from "./routes/book/notesRoutes.js";
import streakRoutes from "./routes/book/streakRoutes.js";
import timelineRoutes from "./routes/book/timelineRoutes.js";
import authRoutes from "./routes/auth/authRoutes.js";
import emailRoutes from "./routes/auth/emailRoutes.js";
import profileRoutes from "./routes/auth/profileRoutes.js";
import insightsRoutes from "./routes/insights/insightsRoutes.js";
import discoveryRoutes from "./routes/discovery/discoveryRoutes.js";
import exportRoutes from "./routes/export/exportRoutes.js";
import importRoutes from "./routes/import/importRoutes.js";
import userRoutes from "./routes/users/userRoutes.js";
import recommendationRoutes from "./routes/recommendations/recommendationRoutes.js";
import notificationRoutes from "./routes/notifications/notificationRoutes.js";
import { generalLimiter } from "./middleware/rateLimiting/generalLimiter.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

app.use("/api/auth", authRoutes, emailRoutes);
app.use("/api/user", profileRoutes);
app.use("/api/books", bookRoutes, sessionRoutes, goalRoutes, notesRoutes);
app.use("/api/achievements", achievementsRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/streaks", streakRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/discovery", discoveryRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/import", importRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/notifications", notificationRoutes);

// Legacy aliases for backward compatibility
app.use("/api/books", authRoutes, emailRoutes, profileRoutes);
app.use("/api/books", achievementsRoutes, challengeRoutes, streakRoutes, timelineRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({ code: "NOT_FOUND", message: "Not Found" });
});

app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(500).json({
    code: "SERVER_ERROR",
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

export default app;
