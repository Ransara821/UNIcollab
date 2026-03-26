const QuizAttempt = require('../models/QuizAttempt');

// @desc    Get leaderboard for a specific quiz
// @route   GET /api/quizzes/:id/leaderboard
exports.getQuizLeaderboard = async (req, res) => {
  try {
    const quizId = req.params.id;
    // We want to find the highest score for each user for this quiz
    const leaderboard = await QuizAttempt.aggregate([
      { $match: { quizId: new require('mongoose').Types.ObjectId(quizId) } },
      { $sort: { score: -1, submittedAt: 1 } },
      {
        $group: {
          _id: '$userId',
          highestScore: { $first: '$score' },
          percentage: { $first: '$percentage' },
          submittedAt: { $first: '$submittedAt' },
          totalQuestions: { $first: '$totalQuestions' }
        }
      },
      { $sort: { highestScore: -1, submittedAt: 1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get global leaderboard (Filtered by year/semester)
// @route   GET /api/quizzes/leaderboard
exports.getGlobalLeaderboard = async (req, res) => {
  try {
    const { year, semester } = req.query;
    const filter = {};
    if (year) filter.year = year;
    if (semester) filter.semester = semester;

    const leaderboard = await QuizAttempt.aggregate([
      { $match: filter },
      { $sort: { score: -1, submittedAt: 1 } },
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$score' },
          quizzesAttempted: { $sum: 1 },
          averagePercentage: { $avg: '$percentage' }
        }
      },
      { $sort: { totalScore: -1 } },
      { $limit: 20 }
    ]);

    res.status(200).json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Admin: View all attempts for a quiz
// @route   GET /api/admin/quizzes/:id/attempts
exports.getAdminAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ quizId: req.params.id }).sort({ submittedAt: -1 });
    res.status(200).json({ success: true, data: attempts });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
