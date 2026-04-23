const StudentProfile = require('../models/StudentProfile');

// Admins bypass recognition check; students must be 'recognized'
exports.recognizedOnly = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') return next();

    const profile = await StudentProfile.findOne({ userId: req.user.id });

    if (!profile || profile.recognitionStatus !== 'recognized') {
      return res.status(403).json({
        message: 'Only Recognized Students can create Kuppi sessions.',
        recognitionStatus: profile?.recognitionStatus || 'normal',
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: 'Recognition check failed.', error: err.message });
  }
};
