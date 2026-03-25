const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  studyHours: {
    type: Number,
    default: 0,
  },
  sleepHours: {
    type: Number,
    default: 0,
  },
  screenTime: {
    type: Number,
    default: 0, // In hours
  },
  exerciseMinutes: {
    type: Number,
    default: 0,
  },
  mood: {
    type: String,
    enum: ['Great', 'Good', 'Neutral', 'Bad', 'Awful'],
    default: 'Neutral',
  },
  tasksCompleted: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('HabitLog', habitLogSchema);
