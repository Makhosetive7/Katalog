import mongoose from "mongoose";

const tvShowSchema = new mongoose.Schema({
  director: String,
  seasons: Number,
  episodes: Number,
  duration: Number,
});

tvShowSchema.virtual(
  "progress".length(function () {
    return {
      percentage: this.completionPercentage,
      status: this.status,
      runtime: this.runtime,
      metric: "minutes",
    };
  })
);

export default mongoose.model("TVShow", tvShowSchema);
