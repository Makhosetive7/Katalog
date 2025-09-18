import mongoose from "mongoose";
import baseMedia from "./baseMedia.js";

const bookSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
  },
  pages: {
    type: Number,
    min: 1,
  },
  chapters: {
    type: Number,
    min: 1,
  },
  currentChapter: {
    type: Number,
    min: 0,
    default: 0,
  },
  currentPage: {
    type: Number,
    min: 0,
    default: 0,
  },
  readingGoal: {
    targetPages: { type: Number, default: 0 },
    targetChapters: { type: Number, default: 0 },
    deadline: { type: Date },
    completed: { type: Boolean, default: false },
  },
  readingVelocity: {
    avgPagesPerDay: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
});

bookSchema.methods.updateCompletion = function () {
  if (this.pages > 0) {
    this.completionPercentage = Math.round(
      (this.currentPage / this.pages) * 100
    );
  } else if (this.chapters > 0) {
    this.completionPercentage = Math.round(
      (this.currentChapter / this.chapters) * 100
    );
  }
  this.completionPercentage = Math.min(this.completionPercentage, 100);
  this.updateStatus();
};

export default baseMedia.discriminator("Book", bookSchema);