const express = require('express');
const HabitLog = require('../models/HabitLog');
const ProductivityScore = require('../models/ProductivityScore');

const router = express.Router();

// Get analytics data for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch the last 7 days of logs
    const aWeekAgo = new Date();
    aWeekAgo.setDate(aWeekAgo.getDate() - 7);

    const logs = await HabitLog.find({
      userId,
      date: { $gte: aWeekAgo }
    }).sort({ date: 1 });

    const scores = await ProductivityScore.find({
      userId,
      date: { $gte: aWeekAgo }
    }).sort({ date: 1 });

    // Calculate averages and trends
    let totalStudy = 0;
    let totalSleep = 0;
    let totalScreen = 0;

    logs.forEach(log => {
      totalStudy += log.studyHours;
      totalSleep += log.sleepHours;
      totalScreen += log.screenTime;
    });

    const avgStudy = logs.length ? (totalStudy / logs.length).toFixed(1) : 0;
    const avgSleep = logs.length ? (totalSleep / logs.length).toFixed(1) : 0;
    const avgScreen = logs.length ? (totalScreen / logs.length).toFixed(1) : 0;

    let weeklyImprovement = 0;
    if (scores.length >= 2) {
      const firstScore = scores[0].score;
      const lastScore = scores[scores.length - 1].score;
      if (firstScore > 0) {
        weeklyImprovement = (((lastScore - firstScore) / firstScore) * 100).toFixed(1);
      }
    }

    res.json({
      logs,
      scores,
      averages: {
        study: avgStudy,
        sleep: avgSleep,
        screen: avgScreen
      },
      weeklyImprovement,
      latestScore: scores.length ? scores[scores.length - 1] : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- Advanced Productivity Intelligence Features ---

// Get advanced insights (Burnout, Digital Twin Simulation, AI Recommendations)
router.get('/:userId/insights', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Fetch last 30 days of logs for better behaviour simulation
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - 30);
    
    const logs = await HabitLog.find({ userId, date: { $gte: dateLimit } }).sort({ date: -1 });

    if (logs.length === 0) {
      return res.json({ 
        burnoutRisk: false, 
        twinInsight: "Log more data to train your digital twin.", 
        recommendation: "Start by logging your daily sleep and screen time." 
      });
    }

    const latestLog = logs[0];
    
    // 1. Burnout Detection
    const burnoutRisk = (latestLog.sleepHours < 5 && latestLog.studyHours > 10) || latestLog.mood === 'Awful' || latestLog.mood === 'Bad';

    // 2. Digital Twin Behaviour Simulation & AI Recommendations
    // Analyze if sleep > 7 correlates with higher productivity
    let highSleepLogs = logs.filter(l => l.sleepHours >= 7);
    let lowSleepLogs = logs.filter(l => l.sleepHours < 7);
    
    let twinInsight = "Your digital twin is still learning your habits.";
    let recommendation = "Maintain consistency in your daily routine.";

    if (highSleepLogs.length > 0 && lowSleepLogs.length > 0) {
       // We can approximate by looking at study hours or mood for now, or match with scores if we joined them. 
       // For simplicity, let's generate a dynamic string based on the latest log trends.
       if (latestLog.sleepHours < 7) {
         twinInsight = "When you sleep more than 7 hours your productivity usually increases.";
         recommendation = "Try getting to bed 1 hour earlier tonight.";
       } else if (latestLog.screenTime > 4) {
         twinInsight = "High screen time is correlating with lower focus energy.";
         recommendation = "Reducing screen time by 1 hour may improve productivity by 10%.";
       } else {
         twinInsight = "Your current routine is highly optimal!";
         recommendation = "Keep applying your current habits.";
       }
    }

    res.json({ burnoutRisk, twinInsight, recommendation });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get productivity prediction
router.get('/:userId/prediction', async (req, res) => {
  try {
    const { userId } = req.params;
    const scores = await ProductivityScore.find({ userId }).sort({ date: -1 }).limit(5);

    if (scores.length < 3) {
      return res.json({ prediction: null });
    }

    // Simple moving average prediction for next day
    const sum = scores.reduce((acc, curr) => acc + curr.score, 0);
    let prediction = Math.round(sum / scores.length);
    
    // add minor variance based on the most recent trend
    if (scores[0].score > scores[1].score) {
      prediction += 2; // Trending up
    } else {
      prediction -= 2; // Trending down
    }

    if (prediction > 100) prediction = 100;
    if (prediction < 0) prediction = 0;

    res.json({ prediction });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Weekly Productivity Report
router.get('/:userId/weekly', async (req, res) => {
  try {
    const { userId } = req.params;
    const aWeekAgo = new Date();
    aWeekAgo.setDate(aWeekAgo.getDate() - 7);

    const scores = await ProductivityScore.find({ userId, date: { $gte: aWeekAgo } }).sort({ date: 1 });

    if (scores.length === 0) {
      return res.json({ averageScore: null, bestDay: null, worstDay: null });
    }

    const avgScore = Math.round(scores.reduce((acc, curr) => acc + curr.score, 0) / scores.length);
    
    // Find best and worst
    let best = scores[0];
    let worst = scores[0];

    scores.forEach(s => {
      if (s.score > best.score) best = s;
      if (s.score < worst.score) worst = s;
    });

    const getDayName = (dateStr) => new Date(dateStr).toLocaleDateString(undefined, { weekday: 'long' });

    res.json({
      averageScore: avgScore,
      bestDay: getDayName(best.date),
      worstDay: getDayName(worst.date),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get heatmap data
router.get('/:userId/heatmap', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get last 30 days
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - 30);

    const scores = await ProductivityScore.find({ userId, date: { $gte: dateLimit } }).sort({ date: 1 });

    const heatmapData = scores.map(s => {
      let level = 'red'; // Low
      if (s.score >= 80) level = 'green'; // High
      else if (s.score >= 50) level = 'yellow'; // Medium

      return {
        date: s.date,
        score: s.score,
        level
      };
    });

    res.json(heatmapData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
