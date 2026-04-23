const StudyGroup    = require('../models/StudyGroup');
const StudentProfile = require('../models/StudentProfile');
const JoinRequest   = require('../models/JoinRequest');
const Announcement  = require('../models/Announcement');
const Rating        = require('../models/Rating');
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
    if (group.status === 'closed') return res.status(400).json({ message: 'Project has ended — status cannot be changed' });
    group.status = group.status === 'open' ? 'full' : 'open';
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.endProject = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.leader !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    if (group.status === 'closed') return res.status(400).json({ message: 'Project has already ended' });
    group.status = 'closed';
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.leader !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const { name, groupNumber, subject, description, requiredSkills, workingStyle, maxSize, deadline } = req.body;
    if (name)           group.name           = name;
    if (groupNumber !== undefined) group.groupNumber = groupNumber;
    if (subject !== undefined)     group.subject     = subject;
    if (description !== undefined) group.description = description;
    if (requiredSkills) { group.requiredSkills = requiredSkills; group.skillVector = buildSkillVector(requiredSkills); }
    if (workingStyle)   group.workingStyle   = workingStyle;
    if (maxSize)        group.maxSize        = maxSize;
    if (deadline !== undefined) group.deadline = deadline ? new Date(deadline) : undefined;

    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.leaveGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.status !== 'closed')
      return res.status(400).json({ message: 'You can only leave after the project has ended' });
    if (group.leader === req.user.id)
      return res.status(400).json({ message: 'Leaders cannot leave — delete the group instead' });

    const isMember = group.members.some(m => m.userId === req.user.id);
    if (!isMember) return res.status(400).json({ message: 'You are not a member of this group' });

    group.members = group.members.filter(m => m.userId !== req.user.id);
    await group.save();

    await StudentProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $unset: { groupId: '' }, $set: { status: 'lookingForGroup' } }
    );

    res.json({ message: 'You have left the group' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.leader !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const memberIds = group.members.map(m => m.userId);

    await Promise.all([
      StudyGroup.findByIdAndDelete(group._id),
      JoinRequest.deleteMany({ groupId: group._id }),
      Announcement.deleteMany({ groupId: group._id }),
      Rating.deleteMany({ groupId: group._id }),
      StudentProfile.updateMany(
        { userId: { $in: memberIds } },
        { $unset: { groupId: '' }, $set: { status: 'lookingForGroup' } }
      ),
    ]);

    res.json({ message: 'Group deleted' });
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
