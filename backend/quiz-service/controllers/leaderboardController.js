const QuizAttempt = require('../models/QuizAttempt');
const mongoose = require('mongoose');

exports.getLeaderboard = async (req, res) => {
  try {
    const { quizId, subjectId, semester, year } = req.query;

    const matchQuery = { status: 'completed' };
    if (quizId) matchQuery.quizId = new mongoose.Types.ObjectId(quizId);
    if (subjectId) matchQuery.subjectId = new mongoose.Types.ObjectId(subjectId);
    if (semester) matchQuery.semester = semester;
    if (year) matchQuery.year = year;

    const pipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: "$studentId",
          userName: { $first: "$userName" },
          bestScore: { $max: "$score" },
          totalAttempts: { $sum: 1 },
          bestTime: { $min: "$durationUsed" }, 
          latestAttempt: { $max: "$submittedAt" }
        }
      },
      { $sort: { bestScore: -1, bestTime: 1, latestAttempt: 1 } },
      {
        $project: {
          studentId: "$_id",
          userName: 1,
          score: "$bestScore",
          attempts: "$totalAttempts",
          timeTaken: "$bestTime",
          _id: 0
        }
      }
    ];

    const leaderboard = await QuizAttempt.aggregate(pipeline);

    res.json({ success: true, count: leaderboard.length, data: leaderboard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
