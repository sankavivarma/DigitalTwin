const express = require('express');
const FocusSession = require('../models/FocusSession');

const router = express.Router();

// Save a completed session
router.post('/', async (req, res) => {
  try {
    const { userId, durationMinutes, type } = req.body;
    const session = new FocusSession({ userId, durationMinutes, type });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get focus insights like the most productive time
router.get('/:userId/insights', async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await FocusSession.find({ userId, type: 'focus' });

    if (sessions.length === 0) {
       return res.json({ bestTime: null });
    }

    // A simple tally of the hour of the day
    const hourCounts = new Array(24).fill(0);
    sessions.forEach(s => {
      const hour = new Date(s.date).getHours();
      hourCounts[hour]++;
    });

    const maxIndex = hourCounts.indexOf(Math.max(...hourCounts));
    
    // Format the hour
    const formatHour = (h) => {
      const ampm = h >= 12 ? 'PM' : 'AM';
      let formattedHour = h % 12;
      if (formattedHour === 0) formattedHour = 12;
      return `${formattedHour}:00 ${ampm}`;
    };

    const bestStartTime = formatHour(maxIndex);
    const bestEndTime = formatHour((maxIndex + 2) % 24);

    res.json({
       bestTime: `${bestStartTime} – ${bestEndTime}`
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
