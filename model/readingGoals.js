import mongoose from "mongoose";

const readingGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    type: {
      type: String,
      enum: ["pages", "chapters", "time", "completion"],
      required: true,
    },
    target: {
      type: Number,
      required: true,
      min: 1,
    },
    timeFrame: {
      type: String,
      enum: ["daily", "weekly", "monthly", "custom"],
      default: "custom",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    progress: {
      type: Number,
      default: 0,
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

readingGoalSchema.index({ user: 1, book: 1, completed: 1 });
readingGoalSchema.index({ endDate: 1 });

export default mongoose.model("ReadingGoal", readingGoalSchema);
