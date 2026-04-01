const Question = require('../models/Question');
const Quiz = require('../models/Quiz');

exports.getQuestionsForQuiz = async (req, res) => {
  try {
    const questions = await Question.find({ quizId: req.params.quizId });
    res.json({ success: true, count: questions.length, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    req.body.quizId = req.params.quizId;
    const q = await Question.create(req.body);
    
    const quiz = await Quiz.findById(req.params.quizId);
    if(quiz) {
       quiz.totalMarks += (q.marks || 1);
       await quiz.save();
    }
    
    res.status(201).json({ success: true, data: q });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const q = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!q) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: q });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ success: false, message: 'Not found' });

    const marks = q.marks;
    const quizId = q.quizId;
    
    await q.deleteOne();
    
    const quiz = await Quiz.findById(quizId);
    if(quiz) {
       quiz.totalMarks = Math.max(0, quiz.totalMarks - marks);
       await quiz.save();
    }
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
