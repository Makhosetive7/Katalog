import mongoose from "mongoose";
import BaseMedia from "./baseMedia.js";

const gameSchema = new mongoose.Schema({
  platform: [
    {
      type: String,
      required: true,
    },
  ],
  currentLevel: {
    type: Number,
    min: 0,
    default: 0,
  },
  developer: String,
  publisher: String,
  playtime: Number,
});

gameSchema.virtual("progress").get(function () {
  return {
    percentage: this.completionPercentage,
    status: this.status,
    playtime: this.playtime || 0,
    metric: "hours",
  };
});

export default BaseMedia.discriminator("Game", gameSchema);
