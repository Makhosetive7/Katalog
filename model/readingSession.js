import mongoose from "mongoose";

const readingSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    index: true,
  },
  pagesRead: {
    type: Number,
    default: 0,
  },
  chaptersRead: {
    type: Number,
    default: 0,
  },
  readingTime: {
    type: Number,
    default: 0,
  },
  chapter: Number,
  mood: {
    type: String,
    enum: [
      "excited",
      "focused",
      "relaxed",
      "bored",
      "confused",
      "inspired",
      "neutral",
    ],
  },
});

readingSessionSchema.index({ user: 1, book: 1, date: -1 });

export default mongoose.model("ReadingSession", readingSessionSchema);