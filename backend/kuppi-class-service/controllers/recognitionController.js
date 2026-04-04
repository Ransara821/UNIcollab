const KuppiClass    = require('../models/KuppiClass');
const Rating        = require('../models/Rating');
const StudentProfile = require('../models/StudentProfile');
const Enrollment    = require('../models/Enrollment');
const { RECOGNITION_THRESHOLDS } = require('../constants/filterOptions');

const { MIN_COMPLETED_SESSIONS, MIN_AVERAGE_RATING } = RECOGNITION_THRESHOLDS;

// Re-compute and persist recognition status for a given userId.
// Never downgrades a user who is already recognized (form-based or otherwise).
async function evaluateRecognition(userId) {
  const completedSessionsCount = await KuppiClass.countDocuments({
    postedById: userId,   // count all sessions hosted, regardless of date
  });

  const ratingDocs = await Rating.find({ hostId: userId });
  const averageRating =
    ratingDocs.length > 0
      ? ratingDocs.reduce((sum, r) => sum + r.rating, 0) / ratingDocs.length
      : 0;

  const meetsThresholds =
    completedSessionsCount >= MIN_COMPLETED_SESSIONS &&
    averageRating >= MIN_AVERAGE_RATING;

  const current           = await StudentProfile.findOne({ userId });
  const alreadyRecognized = current?.recognitionStatus === 'recognized';

  return StudentProfile.findOneAndUpdate(
    { userId },
    {
      // Only upgrade; never downgrade from a previously granted recognition
      recognitionStatus: (meetsThresholds || alreadyRecognized) ? 'recognized' : 'normal',
      completedSessionsCount,
      averageRating: parseFloat(averageRating.toFixed(1)),
    },
    { upsert: true, new: true }
  );
}

// GET /api/kuppi-class/my-status
// Always recomputes counts from source so they stay in sync after sessions complete.
// Never downgrades recognition that was already granted (form-based or metric-based).
exports.getMyStatus = async (req, res) => {
  try {
    const completedSessionsCount = await KuppiClass.countDocuments({
      postedById: req.user.id,   // count all sessions hosted, regardless of date
    });

    const ratingDocs   = await Rating.find({ hostId: req.user.id });
    const averageRating =
      ratingDocs.length > 0
        ? ratingDocs.reduce((sum, r) => sum + r.rating, 0) / ratingDocs.length
        : 0;

    const meetsThresholds =
      completedSessionsCount >= MIN_COMPLETED_SESSIONS &&
      averageRating >= MIN_AVERAGE_RATING;

    const existing         = await StudentProfile.findOne({ userId: req.user.id });
    const alreadyRecognized = existing?.recognitionStatus === 'recognized';

    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user.id },
      {
        completedSessionsCount,
        averageRating: parseFloat(averageRating.toFixed(1)),
        // Only upgrade to recognized, never downgrade
        ...(meetsThresholds || alreadyRecognized ? { recognitionStatus: 'recognized' } : {}),
      },
      { upsert: true, new: true }
    );

    res.json({
      recognitionStatus:    profile.recognitionStatus,
      completedSessionsCount: profile.completedSessionsCount,
      averageRating:        profile.averageRating,
      thresholds: { MIN_COMPLETED_SESSIONS, MIN_AVERAGE_RATING },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get recognition status.', error: err.message });
  }
};

// POST /api/kuppi-class/:id/rate  { rating: 1-5 }
exports.rateSession = async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    const kuppiClass = await KuppiClass.findById(req.params.id);
    if (!kuppiClass) return res.status(404).json({ message: 'Session not found.' });

    // Check if session has a host assigned
    let hostId = kuppiClass.postedById;
    
    if (!hostId) {
      return res.status(400).json({ 
        message: 'This session has no assigned host and cannot be rated.',
        detail: 'The session must have a host (tutor) assigned to be ratable. Please contact the session creator to resolve this issue.'
      });
    }

    if (new Date(kuppiClass.sessionDate) >= new Date()) {
      return res.status(400).json({ message: 'Can only rate completed sessions.' });
    }

    if (hostId === req.user.id) {
      return res.status(400).json({ message: 'Cannot rate your own session.' });
    }

    // Check if student is enrolled in the session with accepted status
    const enrollment = await Enrollment.findOne({
      studentId: req.user.id,
      kuppiClassId: req.params.id,
      status: 'accepted'
    });
    if (!enrollment) {
      return res.status(403).json({ message: 'You can only rate sessions you are enrolled in with accepted status.' });
    }

    const existing = await Rating.findOne({ kuppiClassId: req.params.id, ratedBy: req.user.id });
    if (existing) {
      return res.status(409).json({ message: 'You have already rated this session.' });
    }

    await Rating.create({
      kuppiClassId: kuppiClass._id,
      ratedBy: req.user.id,
      hostId: hostId,
      rating: Number(rating),
    });

    // Auto-evaluate the host's recognition after every new rating
    if (hostId) {
      await evaluateRecognition(hostId);
    }

    res.status(201).json({ message: 'Rating submitted. Host recognition re-evaluated.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You have already rated this session.' });
    }
    res.status(500).json({ message: 'Failed to submit rating.', error: err.message });
  }
};

// GET /api/kuppi-class/:id/ratings - Get all ratings for a session
exports.getSessionRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ kuppiClassId: req.params.id })
      .sort({ createdAt: -1 });

    const kuppiClass = await KuppiClass.findById(req.params.id);
    if (!kuppiClass) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    res.json({
      sessionId: req.params.id,
      sessionTitle: kuppiClass.title,
      totalRatings: ratings.length,
      averageRating: ratings.length > 0 
        ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
        : 0,
      ratings
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch ratings.', error: err.message });
  }
};

// GET /api/kuppi-class/host/my-ratings - Get all ratings received by the current user (host)
exports.getMyReceivedRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ hostId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      hostId: req.user.id,
      totalRatings: ratings.length,
      averageRating: ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
        : 0,
      ratings
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your ratings.', error: err.message });
  }
};
