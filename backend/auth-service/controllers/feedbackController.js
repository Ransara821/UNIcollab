const Feedback = require('../models/Feedback');

// @POST /api/auth/feedback
exports.submitFeedback = async (req, res) => {
    try {
        const {
            category,
            targetAreas,
            ratings,
            painPoints,
            featureSuggestion,
            contactPermission,
            isAnonymous,
        } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Derive legacy fields for backward compatibility
        const overallRating = ratings?.overallSatisfaction || 3;
        const legacyComment = painPoints || featureSuggestion || '';

        const feedback = await Feedback.create({
            user: req.user.id,
            category: category || 'appreciation',
            targetAreas: targetAreas || [],
            ratings: ratings || {},
            painPoints: painPoints || '',
            featureSuggestion: featureSuggestion || '',
            contactPermission: !!contactPermission,
            isAnonymous: !!isAnonymous,
            // legacy
            rating: overallRating,
            comment: legacyComment,
        });

        res.status(201).json({ message: 'Feedback submitted successfully', feedback });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @GET /api/auth/feedback/public
exports.getPublicFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ isAnonymous: false })
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
        const feedbacks = await Feedback.find()
            .sort({ createdAt: -1 })
            .populate('user', 'name email');
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
