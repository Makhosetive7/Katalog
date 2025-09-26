import mongoose from "mongoose";

const ReadingChallengeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    year: {
      type: Number,
      required: true,
      default: () => new Date().getFullYear(),
    },
    goal: {
      type: Number,
      required: true,
      min: 1,
    },
    currentCount: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedDate: Date,
    books: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
    ],
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

ReadingChallengeSchema.index({ user: 1, year: 1 }, { unique: true });

export default mongoose.model("ReadingChallenge", ReadingChallengeSchema);
