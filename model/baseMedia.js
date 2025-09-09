import mongoose from "mongoose";

const baseMediaSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  genre: [String],
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  notes: String,
  imageUrl: String,
  status: {
    type: String,
    enum: ["Planned", "In-Progress", "Completed", "Dropped"],
    default: "Planned"
  },
  timeline: {
    startedAt: Date,
    completedAt: Date,
    timeSpent: Number // Total hours spent
  },
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, { 
  timestamps: true,
  discriminatorKey: 'type',
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true } 
});

// Virtual for progress (common logic)
baseMediaSchema.virtual('progress').get(function() {
  return {
    percentage: this.completionPercentage,
    status: this.status
  };
});

// Method to update status based on completion
baseMediaSchema.methods.updateStatus = function() {
  if (this.completionPercentage >= 95 && this.status !== "Completed") {
    this.status = "Completed";
    this.timeline.completedAt = new Date();
    if (this.timeline.startedAt) {
      this.timeline.timeSpent = (this.timeline.completedAt - this.timeline.startedAt) / (1000 * 60 * 60);
    }
  } else if (this.completionPercentage > 0 && this.status === "Planned") {
    this.status = "In Progress";
    if (!this.timeline.startedAt) {
      this.timeline.startedAt = new Date();
    }
  }
};

export default mongoose.model('BaseMedia', baseMediaSchema);