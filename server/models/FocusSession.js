const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  durationMinutes: {
    type: Number,
    required: true,
    default: 25,
  },
  type: {
    type: String,
    enum: ['focus', 'break'],
    default: 'focus',
  },
  date: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('FocusSession', focusSessionSchema);
