const mongoose = require('mongoose');

const productivityScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  analysisResult: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('ProductivityScore', productivityScoreSchema);
