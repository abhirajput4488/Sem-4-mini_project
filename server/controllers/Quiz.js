const QuizResult = require("../models/QuizResult");

exports.saveQuizResult = async (req, res) => {
  try {
    const { topic, totalQuestions, correctAnswers, wrongAnswers } = req.body;
    const userId = req.user.id;

    console.log("Saving quiz result for user:", userId, "with data:", req.body);

    if (!userId || !topic || totalQuestions == null || correctAnswers == null || wrongAnswers == null) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.',
        receivedData: { userId, topic, totalQuestions, correctAnswers, wrongAnswers }
      });
    }

    const result = new QuizResult({
      userId,
      topic,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      quizDate: new Date()
    });

    await result.save();
    console.log("Quiz result saved successfully:", result);

    res.status(201).json({
      success: true,
      message: 'Quiz result saved successfully.',
      data: result
    });
  } catch (err) {
    console.error('Error saving quiz result:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: err.message
    });
  }
};

exports.getQuizResults = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Fetching results for user:", userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const results = await QuizResult.find({ userId })
      .sort({ quizDate: -1 }) // Sort by date, newest first
      .limit(10); // Get last 10 results

    console.log("Found results:", results);

    res.status(200).json({
      success: true,
      message: 'Quiz results retrieved successfully.',
      results: results || [] // Ensure we always return an array
    });
  } catch (err) {
    console.error('Error fetching quiz results:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: err.message
    });
  }
};
