const StudyGroup    = require('../models/StudyGroup');
const StudentProfile = require('../models/StudentProfile');
const { computeCompatibility } = require('../utils/matching');

exports.getSuggestions = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id });
    if (!profile) return res.status(400).json({ message: 'Set up your profile first' });

    const groups = await StudyGroup.find({ status: 'open' });

    const scored = groups
      .map(g => ({ ...g.toObject(), compatibility: computeCompatibility(profile, g) }))
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, 10);

    res.json(scored);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
