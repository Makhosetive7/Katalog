import mongoose from 'mongoose';
import baseMedia from './baseMedia.js';

const bookSchema = new mongoose.Schema({
  // Book-specific fields
  author: {
    type: String,
    required: true
  },
  pages: {
    type: Number,
    required: true,
    min: 1
  },
  totalChapters: {
    type: Number,
    min: 1,
    default: 1
  },
  currentChapter: {
    type: Number,
    min: 0,
    default: 0
  },
  currentPage: {
    type: Number,
    min: 0,
    default: 0
  },
  chapterNotes: [{
    chapter: Number,
    note: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
});

// Override progress virtual for books
bookSchema.virtual('progress').get(function() {
  const pageProgress = this.pages > 0 
    ? { current: this.currentPage, total: this.pages, metric: "pages" }
    : null;
    
  const chapterProgress = this.totalChapters > 0
    ? { current: this.currentChapter, total: this.totalChapters, metric: "chapters" }
    : null;

  return {
    percentage: this.completionPercentage,
    status: this.status,
    pageProgress,
    chapterProgress
  };
});

// Method to update completion for books
bookSchema.methods.updateCompletion = function() {
  if (this.pages > 0) {
    this.completionPercentage = Math.round((this.currentPage / this.pages) * 100);
  } else if (this.totalChapters > 0) {
    this.completionPercentage = Math.round((this.currentChapter / this.totalChapters) * 100);
  }
  this.completionPercentage = Math.min(this.completionPercentage, 100);
  this.updateStatus(); // Call parent method
};

export default baseMedia.discriminator('Book', bookSchema);