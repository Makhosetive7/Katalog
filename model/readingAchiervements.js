import mongoose from "mongoose";

const AchievementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "books_read",
        "pages_read",
        "streak_length",
        "genre_explorer",
        "challenge_completed",
        "speed_reader",
      ],
    },
    level: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      value: Number,
      bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
      genre: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 1800, // 30 minutes for demo users
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Achievement", AchievementSchema);
