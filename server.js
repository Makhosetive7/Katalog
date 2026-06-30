import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/database.js";
import { testEmailConnection } from "./service/emailService/emailService.js";
import swaggerDocs from "./config/swagger.js";

dotenv.config();

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

const startServer = async () => {
  try {
    await connectDB();
    await testEmailConnection();

    swaggerDocs(app);

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
