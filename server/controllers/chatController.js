const HabitLog = require('../models/HabitLog');
const ProductivityScore = require('../models/ProductivityScore');

exports.handleChatMessage = async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ reply: 'User ID and message are required.' });
    }

    // Lowercase user message to do simple regex/keyword matching
    const msgLower = message.toLowerCase();

    // Fetch the most recent habit log and score for context
    const latestLog = await HabitLog.findOne({ userId }).sort({ date: -1 });
    const latestScore = await ProductivityScore.findOne({ userId }).sort({ date: -1 });

    let reply = "";

    // Check for greetings
    if (msgLower.includes('hello') || msgLower.includes('hi ') || msgLower === 'hi') {
      reply = "Hello! I am your Digital Twin Productivity Assistant. Ask me how you can improve your routine, or ask for an analysis of your recent logs.";
      return res.json({ reply });
    }

    // Rule-based engine logic
    if (msgLower.includes('improve') || msgLower.includes('advice') || msgLower.includes('help')) {
      if (!latestLog) {
        reply = "I don't have enough data yet! Please log your habits in the Dashboard first so I can analyze your routine.";
      } else {
        reply = "Based on your latest log, here is some advice: \n";
        let gaveAdvice = false;

        if (latestLog.sleepHours < 7) {
          reply += "- You are sleeping less than 7 hours. Try to get more rest for better cognitive function.\n";
          gaveAdvice = true;
        }
        if (latestLog.screenTime > 6) {
          reply += "- Your screen time is quite high. Try the 20-20-20 rule to reduce eye strain and take breaks.\n";
          gaveAdvice = true;
        }
        if (latestLog.exerciseMinutes < 30) {
          reply += "- You haven't exercised much. Even a brief 30-minute walk can boost your mood and energy.\n";
          gaveAdvice = true;
        }
        if (latestLog.studyHours < 2) {
          reply += "- Your study/focus hours are low. Consider time-blocking to dedicate uninterrupted time to deep work.\n";
          gaveAdvice = true;
        }
        if (latestLog.mood === 'Bad' || latestLog.mood === 'Awful') {
          reply += "- I noticed your mood wasn't great. Take some time for self-care, meditation, or talking to a friend.\n";
          gaveAdvice = true;
        }

        if (!gaveAdvice) {
          reply += "You're actually doing a great job! Your sleep, exercise, and focus times look solid. Keep up the good work!";
        }
      }
    } else if (msgLower.includes('score') || msgLower.includes('productive') || msgLower.includes('how am i doing')) {
      if (!latestScore || !latestLog) {
        reply = "I don't have enough data to calculate your score. Please log your habits today!";
      } else {
        reply = `Your most recent productivity score is ${latestScore.score}/100. ${latestScore.analysisResult || ''}`;
      }
    } else {
      reply = "I'm a simple rule-based assistant right now. Try asking me for 'advice', how to 'improve', or what your 'score' is!";
    }

    res.json({ reply });

  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ reply: 'Sorry, I encountered an internal error. Please try again later.' });
  }
};
