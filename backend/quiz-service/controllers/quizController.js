const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const quizApiService = require('../services/quizApiService');

// @desc    Create a new quiz (Admin only)
// @route   POST /api/quizzes
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, year, semester, category, difficulty, tags, questionCount } = req.body;

    const quiz = await Quiz.create({
      title,
      description,
      year,
      semester,
      category,
      difficulty,
      tags,
      questionCount,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all quizzes (Filtered by year/semester)
// @route   GET /api/quizzes
exports.getQuizzes = async (req, res) => {
  try {
    const { year, semester } = req.query;
    const filter = { isActive: true };

    if (year) filter.year = year;
    if (semester) filter.semester = semester;

    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: quizzes.length, data: quizzes });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get single quiz details
// @route   GET /api/quizzes/:id
exports.getQuizDetails = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Start a quiz (Fetch questions from QuizAPI)
// @route   GET /api/quizzes/:id/questions
exports.getQuizQuestions = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const questions = await quizApiService.fetchQuestions({
      category: quiz.category,
      difficulty: quiz.difficulty,
      tags: quiz.tags,
      limit: quiz.questionCount
    });

    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit quiz answers and calculate score
// @route   POST /api/quizzes/:id/submit
exports.submitQuiz = async (req, res) => {
  try {
    const { answers, questions, duration } = req.body;
    const quizId = req.params.id;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    let correctCount = 0;
    const results = questions.map((question, index) => {
      const userAnswer = answers[index];
      const correctAnswers = question.correct_answers;
      
      // QuizAPI format: correct_answers is an object { answer_a_correct: "true", ... }
      // user response format should match keys: 'answer_a', 'answer_b', etc.
      
      const isCorrect = correctAnswers[`${userAnswer}_correct`] === "true";
      if (isCorrect) correctCount++;

      return {
        question: question.question,
        userAnswer,
        isCorrect,
        correctValue: Object.keys(correctAnswers).find(key => correctAnswers[key] === "true").replace('_correct', '')
      };
    });

    const totalQuestions = questions.length;
    const percentage = (correctCount / totalQuestions) * 100;
    const score = correctCount; // Simple score for now

    const attempt = await QuizAttempt.create({
      userId: req.user.id,
      quizId,
      score,
      totalQuestions,
      correctCount,
      wrongCount: totalQuestions - correctCount,
      percentage,
      answers: results,
      duration,
      year: quiz.year,
      semester: quiz.semester
    });

    res.status(200).json({
      success: true,
      data: {
        attemptId: attempt._id,
        score,
        totalQuestions,
        correctCount,
        percentage,
        results
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get specific result
// @route   GET /api/quizzes/result/:attemptId
exports.getQuizResult = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.attemptId).populate('quizId');
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }
    res.status(200).json({ success: true, data: attempt });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update quiz (Admin only)
// @route   PUT /api/quizzes/:id
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete quiz (Admin only)
// @route   DELETE /api/quizzes/:id
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    res.status(200).json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
