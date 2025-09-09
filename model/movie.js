import mongoose from 'mongoose';
import BaseMedia from './BaseMedia.js';

const movieSchema = new mongoose.Schema({
  director: String,
  cast: [String],
  duration: Number 
});

movieSchema.virtual('progress').get(function() {
  return {
    percentage: this.completionPercentage,
    status: this.status,
    runtime: this.runtime,
    metric: "minutes"
  };
});

export default BaseMedia.discriminator('Movie', movieSchema);