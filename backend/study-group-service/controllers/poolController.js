const StudentProfile = require('../models/StudentProfile');
const { computeUrgencyScore } = require('../utils/matching');

exports.getPool = async (req, res) => {
  try {
    const profiles = await StudentProfile.find({ status: 'lookingForGroup' });
    const scored = profiles
      .map(p => ({ ...p.toObject(), urgencyScore: computeUrgencyScore(p) }))
      .sort((a, b) => b.urgencyScore - a.urgencyScore);
    res.json(scored);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
