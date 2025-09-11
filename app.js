import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";
import dotenv from "dotenv";
import bookRoutes from "./routes/book/bookRoutes.js";
import gameRoutes from "./routes/game/gameRoutes.js";
import tvShowRoutes from "./routes/tvShow/tvShowRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 5000;

app.use("/api/books", bookRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/tvShow", tvShowRoutes);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error.message);
    process.exit(1);
  }
};

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, 
  })
);

startServer();

export default app;
