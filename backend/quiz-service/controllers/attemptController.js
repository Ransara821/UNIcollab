const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

exports.startAttempt = async (req, res) => {
  try {
    const { quizId } = req.body;
    const userId = req.user?.studentId || req.user?.id || 'temp-user'; 
    const userName = req.user?.name || 'Student';

    const quiz = await Quiz.findById(quizId).populate('subjectId');
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    if (quiz.status !== 'published') return res.status(400).json({ success: false, message: 'Quiz is not published' });

    const existingAttemptsCount = await QuizAttempt.countDocuments({ quizId, studentId: userId });
    if (existingAttemptsCount >= quiz.attemptsAllowed) {
      return res.status(403).json({ success: false, message: 'Attempt limit reached' });
    }

    const activeAttempt = await QuizAttempt.findOne({ quizId, studentId: userId, status: 'in-progress' });
    if (activeAttempt) {
      return res.json({ success: true, data: activeAttempt, message: 'Resuming existing attempt' });
    }

    const attempt = await QuizAttempt.create({
      quizId,
      studentId: userId,
      userName,
      status: 'in-progress',
      startedAt: Date.now(),
      year: quiz.year,
      semester: quiz.semester,
      subjectId: quiz.subjectId?._id
    });

    res.status(201).json({ success: true, data: attempt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.submitAttempt = async (req, res) => {
  try {
    const { answers } = req.body; 
    const attempt = await QuizAttempt.findById(req.params.id);
    
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });
    if (attempt.status !== 'in-progress') return res.status(400).json({ success: false, message: 'Attempt already completed' });

    const quiz = await Quiz.findById(attempt.quizId);
    
    const now = Date.now();
    let durationUsed = Math.floor((now - attempt.startedAt.getTime()) / 1000); 
    const maxDuration = quiz.timeLimit * 60; 
    
    if (durationUsed > maxDuration + 5) {
       // Allow ~5 sec grace period for network latency
       durationUsed = maxDuration; 
    }

    const questions = await Question.find({ quizId: quiz._id });
    const questionMap = {};
    questions.forEach(q => questionMap[q._id.toString()] = q);

    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    const evaluatedAnswers = [];

    (answers || []).forEach(ans => {
      const q = questionMap[ans.questionId];
      if (!q) return;

      const isCorrect = (q.correctAnswer === ans.selectedAnswer);
      const marksAwarded = isCorrect ? q.marks : 0;

      if (isCorrect) correctCount++;
      else if (ans.selectedAnswer) wrongCount++; 

      score += marksAwarded;

      evaluatedAnswers.push({
        questionId: q._id,
        selectedAnswer: ans.selectedAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        marksAwarded
      });
    });

    attempt.answers = evaluatedAnswers;
    attempt.score = score;
    attempt.correctCount = correctCount;
    attempt.wrongCount = wrongCount;
    attempt.totalQuestions = questions.length;
    attempt.durationUsed = durationUsed;
    attempt.submittedAt = now;
    attempt.status = 'completed';

    await attempt.save();

    res.json({ success: true, data: attempt, passed: score >= quiz.passMark });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyAttempts = async (req, res) => {
  try {
    const studentId = req.user?.id || 'temp-user';
    const attempts = await QuizAttempt.find({ studentId })
      .populate('quizId', 'title subjectId timeLimit passMark')
      .populate('answers.questionId', 'question questionText marks explanation')
      .sort('-createdAt');
    res.json({ success: true, count: attempts.length, data: attempts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({})
      .populate('quizId', 'title subjectId')
      .populate('answers.questionId', 'question questionText marks explanation')
      .sort('-createdAt');
    res.json({ success: true, count: attempts.length, data: attempts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
