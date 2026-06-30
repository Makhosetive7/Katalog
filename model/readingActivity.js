import mongoose from "mongoose";

const readingActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    /** Total reading interactions that day (progress, notes, sessions, etc.) */
    sessions: {
      type: Number,
      default: 0,
      min: 0,
    },
    pagesLogged: {
      type: Number,
      default: 0,
      min: 0,
    },
    progressUpdates: {
      type: Number,
      default: 0,
      min: 0,
    },
    notesAdded: {
      type: Number,
      default: 0,
      min: 0,
    },
    booksStarted: {
      type: Number,
      default: 0,
      min: 0,
    },
    booksCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

readingActivitySchema.index({ user: 1, date: 1 }, { unique: true });
readingActivitySchema.index({ user: 1, date: -1 });

export default mongoose.model("ReadingActivity", readingActivitySchema);
