import mongoose from "mongoose";

const readingSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },
    pagesRead: { type: Number, default: 0, min: 0 },
    chaptersRead: { type: Number, default: 0, min: 0 },
    readingTime: { type: Number, default: 0, min: 0 },
    mood: { type: String, trim: true },
    date: { type: Date, default: Date.now },
    demoExpiresAt: { type: Date, default: null, expires: 0 },
  },
  { timestamps: true }
);

readingSessionSchema.index({ user: 1, book: 1, date: -1 });
readingSessionSchema.index({ user: 1, date: -1 });

export default mongoose.model("ReadingSession", readingSessionSchema);
