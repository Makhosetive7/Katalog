import mongoose from "mongoose";

const ReadingStreakSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastReadingDate: Date,
    streakHistory: [
      {
        startDate: Date,
        endDate: Date,
        length: Number,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    demoExpiresAt: {
      type: Date,
      default: null,
      expires: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ReadingStreak", ReadingStreakSchema);
