import mongoose from 'mongoose';
import BaseMedia from './BaseMedia.js';

const gameSchema = new mongoose.Schema({
  platform: [{
    type: String,
    required: true
  }],
  developer: String,
  publisher: String,
  playtime: Number // Total hours played
});

gameSchema.virtual('progress').get(function() {
  return {
    percentage: this.completionPercentage,
    status: this.status,
    playtime: this.playtime || 0,
    metric: "hours"
  };
});

export default BaseMedia.discriminator('Game', gameSchema);