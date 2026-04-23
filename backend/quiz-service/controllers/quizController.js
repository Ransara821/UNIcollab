const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const { fetchQuizApiQuestions, transformQuizApiToLocal } = require('../services/quizApiService');

exports.createQuiz = async (req, res) => {
  try {
    req.body.createdBy = req.user?.id || 'admin'; 
    const quiz = await Quiz.create(req.body);
    res.status(201).json({ success: true, data: quiz });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getQuizzes = async (req, res) => {
  try {
    let query = { ...req.query };
    if (req.user?.role === 'student') {
      query.status = 'published';
    }

    const quizzes = await Quiz.find(query).populate('subjectId', 'name code').sort('-createdAt');
    res.json({ success: true, count: quizzes.length, data: quizzes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getQuizDetails = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('subjectId').populate('questions');
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    res.json({ success: true, data: quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!quiz) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: quiz });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Not found' });
    
    await Question.deleteMany({ quizId: quiz._id });
    await quiz.deleteOne();
    
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.importQuestions = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const { category, difficulty, limit, tags } = req.body;
    
    const rawQuestions = await fetchQuizApiQuestions({ category, difficulty, limit, tags });
    
    if (!rawQuestions || rawQuestions.length === 0) {
      return res.status(400).json({ success: false, message: 'No questions found from QuizAPI for given filters' });
    }

    const transformed = transformQuizApiToLocal(rawQuestions, quiz._id);
    const inserted = await Question.insertMany(transformed);
    
    quiz.totalMarks += inserted.length; 
    quiz.importedFrom = 'quizapi';
    await quiz.save();

    res.status(201).json({ success: true, count: inserted.length, data: inserted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
