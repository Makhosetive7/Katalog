import express from "express";
import connectDB from "./config/database.js";
import dotenv from "dotenv";
import bookRoutes from "./routes/books/bookRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

app.use("/api/books", bookRoutes);

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
startServer();

export default app;
