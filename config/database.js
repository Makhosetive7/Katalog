import mongoose from "mongoose";
import { config } from "./config.js";
import { getMongoDatabaseName, getMongoEnvLabel } from "./mongoConfig.js";

const connectDB = async () => {
  const envLabel = getMongoEnvLabel();

  if (!config.mongoUrl) {
    console.error(
      `Missing MongoDB connection string for ${envLabel}. ` +
        `Set MONGO_URL_${envLabel === "production" ? "PROD" : "DEV"} ` +
        "(or MONGO_URL) in your environment variables."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(config.mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const dbName = getMongoDatabaseName(config.mongoUrl);
    console.log(`MongoDB connected (${envLabel}) → database: ${dbName}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};


export default connectDB;