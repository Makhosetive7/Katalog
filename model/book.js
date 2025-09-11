import mongoose from "mongoose";
import baseMedia from "./baseMedia.js";

const bookSchema = new mongoose.Schema({
  author: { type: String, required: true },
  pages: { type: Number, required: true, min: 1 },
  chapters: { type: Number, required: true, min: 1 },
  currentChapter: { type: Number, min: 0, default: 0 },
  currentPage: { type: Number, min: 0, default: 0 },
  chapterNotes: [
    {
      chapter: Number,
      note: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
    readingTimeline: [{
    date: { type: Date, default: Date.now },
    pagesRead: { type: Number, default: 0 },
    chapter: { type: Number },
  }],
});

bookSchema.virtual("progress").get(function () {
  const pageProgress =
    this.pages > 0
      ? { current: this.currentPage, total: this.pages, metric: "pages" }
      : null;

  const chapterProgress =
    this.chapters > 0
      ? {
          current: this.currentChapter,
          total: this.chapters,
          metric: "chapters",
        }
      : null;

  return {
    percentage: this.completionPercentage,
    status: this.status,
    pageProgress,
    chapterProgress,
  };
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
