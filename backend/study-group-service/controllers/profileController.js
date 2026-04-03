const StudentProfile = require('../models/StudentProfile');
const { buildSkillVector, buildAvailabilityVector } = require('../utils/matching');

exports.getMyProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.saveProfile = async (req, res) => {
  try {
    const { name, email, year, semester, gpa, faculty, skills, workingStyle, availability, deadline, sosFlag, status } = req.body;
    const skillVector   = buildSkillVector(skills || []);
    const availabilityMatrix = buildAvailabilityVector(availability || {});

    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user.id },
      {
        userId: req.user.id,
        name, email, year, semester, gpa: gpa !== undefined ? parseFloat(gpa) : undefined, faculty, skills: skills || [],
        workingStyle, availability: availability || {},
        deadline: deadline ? new Date(deadline) : undefined,
        sosFlag: !!sosFlag,
        status: status || 'lookingForGroup',
        skillVector, availabilityMatrix,
      },
      { upsert: true, new: true }
    );
    res.json({ message: 'Profile saved', profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
