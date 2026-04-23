const Feedback = require('../models/Feedback');

// @POST /api/auth/feedback
exports.submitFeedback = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const feedback = await Feedback.create({
            user: req.user.id,
            rating,
            comment
        });

        res.status(201).json({ message: 'Feedback submitted successfully', feedback });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @GET /api/auth/feedback/public
exports.getPublicFeedbacks = async (req, res) => {
    try {
        // Get latest 6 feedbacks, populating user name
        const feedbacks = await Feedback.find()
            .sort({ createdAt: -1 })
            .limit(6)
            .populate('user', 'name');
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @GET /api/auth/feedback/report
exports.getFeedbackReport = async (req, res) => {
    try {
        // Admins get all records populated with name and email
        const feedbacks = await Feedback.find()
            .sort({ createdAt: -1 })
            .populate('user', 'name email');
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
