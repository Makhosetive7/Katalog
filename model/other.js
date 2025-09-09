import mongoose from "mongoose";

const otherSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    genre: [String],
    releaseDate: Date,
    rating: {
      type: Number,
      min: 0,
      max: 10,
    },
    notes: String,
    duration: Number,

    timeline: {
      startedAt: Date,
      completedAt: Date,
      timeSpent: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Other", otherSchema);
