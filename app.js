import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/database.js";
import { testEmailConnection } from "./service/emailService/emailService.js";

import bookRoutes from "./routes/book/bookRoutes.js";
import achievementsRoutes from "./routes/book/achievmentsRoutes.js";
import challengeRoutes from "./routes/book/challengeRoutes.js";
import goalRoutes from "./routes/book/goalRoutes.js";
import notesRoutes from "./routes/book/notesRoutes.js";
import streakRoutes from "./routes/book/streakRoutes.js";
import timelineRoutes from "./routes/book/timelineRoutes.js";
import authRoutes from "./routes/auth/authRoutes.js";
import emailRoutes from "./routes/auth/emailRoutes.js";
import profileRoutes from "./routes/auth/profileRoutes.js";

dotenv.config();
const app = express();

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

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

app.use(
  "/api/books",
  bookRoutes,
  authRoutes,
  emailRoutes,
  profileRoutes,
  achievementsRoutes,
  challengeRoutes,
  goalRoutes,
  notesRoutes,
  streakRoutes,
  timelineRoutes
);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(500).json({
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

const startServer = async () => {
  try {
    await connectDB();
    await testEmailConnection();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

export default app;
