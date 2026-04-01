const StudyGroup = require('../models/StudyGroup');
const StudentProfile = require('../models/StudentProfile');
const { buildSkillVector } = require('../utils/matching');

exports.getGroups = async (req, res) => {
  try {
    const { search, subject, workingStyle, status, maxSize } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };
    if (subject) query.subject = { $regex: subject, $options: 'i' };
    if (workingStyle) query.workingStyle = workingStyle;
    query.status = status || { $ne: 'closed' };
    if (maxSize) query.maxSize = { $lte: parseInt(maxSize) };

    const groups = await StudyGroup.find(query).sort({ createdAt: -1 }).limit(50);
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { name, groupNumber, subject, description, requiredSkills, workingStyle, maxSize, deadline, leaderName } = req.body;
    const skillVector = buildSkillVector(requiredSkills || []);

    const group = await StudyGroup.create({
      name, groupNumber, subject, description,
      requiredSkills: requiredSkills || [],
      skillVector,
      workingStyle: workingStyle || 'mixed',
      maxSize: maxSize || 5,
      leader: req.user.id,
      members: [{ userId: req.user.id, name: leaderName || 'Leader', joinedAt: new Date() }],
      deadline: deadline ? new Date(deadline) : undefined,
    });

    await StudentProfile.findOneAndUpdate(
      { userId: req.user.id },
      { status: 'inGroup', groupId: group._id },
    );

    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyGroup = async (req, res) => {
  try {
    const uid = req.user.id;
    const led = await StudyGroup.findOne({ leader: uid });
    if (led) return res.json({ group: led, role: 'leader' });
    const member = await StudyGroup.findOne({ 'members.userId': uid });
    if (member) return res.json({ group: member, role: 'member' });
    res.json({ group: null, role: null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.leader !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    group.status = group.status === 'open' ? 'full' : 'open';
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSkillsNeeded = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.leader !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    group.skillsNeeded = req.body.skillsNeeded;
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
