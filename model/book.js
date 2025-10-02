import mongoose from "mongoose";

const { Schema } = mongoose;

const bookSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    genre: [String],
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    notes: String,
    imageUrl: String,
    status: {
      type: String,
      enum: ["Planned", "In-Progress", "Completed", "Dropped"],
      default: "Planned",
    },
    timeline: {
      startedAt: Date,
      completedAt: Date,
      timeSpent: Number, // in hours
    },
    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    demoExpiresAt: {
      type: Date,
      default: null,
      expires: 0,
    },

    // Book-specific fields
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
bookSchema.virtual("progress").get(function () {
  return {
    percentage: this.completionPercentage,
    status: this.status,
  };
});

bookSchema.virtual("readingSessions", {
  ref: "ReadingSession",
  localField: "_id",
  foreignField: "book",
});

bookSchema.virtual("chapterNotes", {
  ref: "ChapterNote",
  localField: "_id",
  foreignField: "book",
});

bookSchema.virtual("readingGoals", {
  ref: "ReadingGoal",
  localField: "_id",
  foreignField: "book",
});

// Methods
bookSchema.methods.updateStatus = function () {
  if (this.completionPercentage >= 95 && this.status !== "Completed") {
    this.status = "Completed";
    this.timeline.completedAt = new Date();
    if (this.timeline.startedAt) {
      this.timeline.timeSpent =
        (this.timeline.completedAt - this.timeline.startedAt) /
        (1000 * 60 * 60); // hours
    }
  } else if (this.completionPercentage > 0 && this.status === "Planned") {
    this.status = "In-Progress";
    if (!this.timeline.startedAt) {
      this.timeline.startedAt = new Date();
    }
  }
};

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

export default mongoose.model("Book", bookSchema);
