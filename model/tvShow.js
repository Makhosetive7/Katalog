import mongoose from "mongoose";
import BaseMedia from "./baseMedia.js"; 

const tvShowSchema = new mongoose.Schema({
  director: String,
  seasons: {
    type: Number,
    default: 0
  },
  totalSeasons: {
    type: Number,
    default: 0
  },
  episodes: {
    type: Number,
    default: 0
  },
  totalEpisodes: {
    type: Number,
    default: 0
  },
  currentSeason: {
    type: Number,
    default: 0,
    min: 0
  },
  currentEpisode: {
    type: Number,
    default: 0,
    min: 0
  },
  duration: {
    type: Number,
    default: 0
  },
  cast: [String],
}, { discriminatorKey: 'type' });

tvShowSchema.virtual("progress").get(function() {
  const seasonProgress = this.totalSeasons > 0 
    ? { current: this.currentSeason, total: this.totalSeasons, metric: "seasons" }
    : null;
    
  const episodeProgress = this.totalEpisodes > 0
    ? { current: this.currentEpisode, total: this.totalEpisodes, metric: "episodes" }
    : null;

  return {
    percentage: this.completionPercentage,
    status: this.status,
    seasonProgress,
    episodeProgress
  };
});

export default BaseMedia.discriminator('TVShow', tvShowSchema);