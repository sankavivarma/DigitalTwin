const express = require('express');
const HabitLog = require('../models/HabitLog');
const ProductivityScore = require('../models/ProductivityScore');

const router = express.Router();

// Get all habit logs for a user
router.get('/:userId', async (req, res) => {
  try {
    const logs = await HabitLog.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Log a new habit
router.post('/', async (req, res) => {
  try {
    const { userId, studyHours, sleepHours, screenTime, exerciseMinutes, mood, tasksCompleted } = req.body;

    const newLog = new HabitLog({
      userId,
      studyHours,
      sleepHours,
      screenTime,
      exerciseMinutes,
      mood,
      tasksCompleted
    });

    await newLog.save();

    // Calculate Productivity Score
    // Example logic:
    // Productivity Score = (Study Hours × 5) + (Exercise × 2) + (Sleep Hours × 3) − (Screen Time × 2)
    let score = (studyHours * 5) + ((exerciseMinutes / 60) * 2 * 60) + (sleepHours * 3) - (screenTime * 2);
    score += (tasksCompleted * 2);

    // Normalize roughly to 100
    if (score > 100) score = 100;
    if (score < 0) score = 0;

    score = Math.round(score);

    let analysisResult = `Your productivity score is ${score}. `;
    if (sleepHours < 7) {
      analysisResult += 'Getting more sleep could improve your score. ';
    }
    if (screenTime > 4) {
      analysisResult += 'Try to reduce screen time. ';
    }

    const newScore = new ProductivityScore({
      userId,
      score,
      analysisResult
    });

    await newScore.save();

    res.status(201).json({ log: newLog, score: newScore });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
