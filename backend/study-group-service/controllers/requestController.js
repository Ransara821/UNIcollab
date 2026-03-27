const JoinRequest = require('../models/JoinRequest');
const StudyGroup = require('../models/StudyGroup');
const StudentProfile = require('../models/StudentProfile');

exports.sendRequest = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.status !== 'open') return res.status(400).json({ message: `Group is ${group.status}` });
    if (group.members.some(m => m.userId === req.user.id))
      return res.status(400).json({ message: 'Already a member' });

    const existing = await JoinRequest.findOne({
      groupId: req.params.id, studentId: req.user.id, status: 'pending', direction: 'student-to-group',
    });
    if (existing) return res.status(400).json({ message: 'Request already pending' });

    const request = await JoinRequest.create({
      groupId: req.params.id,
      studentId: req.user.id,
      studentName: req.body.studentName || '',
      studentEmail: req.body.studentEmail || '',
      direction: 'student-to-group',
      message: req.body.message || '',
    });

    await StudentProfile.findOneAndUpdate({ userId: req.user.id }, { $inc: { joinRequestCount: 1 } });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendInvite = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.leader !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const existing = await JoinRequest.findOne({
      groupId: req.params.id, studentId: req.params.studentId, status: 'pending',
    });
    if (existing) return res.status(400).json({ message: 'Invite already pending' });

    const invite = await JoinRequest.create({
      groupId: req.params.id,
      studentId: req.params.studentId,
      direction: 'group-to-student',
      message: req.body.message || '',
    });
    res.status(201).json(invite);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await JoinRequest.find({ studentId: req.user.id })
      .populate('groupId', 'name subject description')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getGroupRequests = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.leader !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const requests = await JoinRequest.find({ groupId: req.params.id, direction: 'student-to-group' })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await JoinRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const group = await StudyGroup.findById(request.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isLeader  = group.leader === req.user.id;
    const isStudent = request.studentId === req.user.id;

    if (!isLeader && !isStudent) return res.status(403).json({ message: 'Not authorized' });

    // Authorization rules per direction
    if (request.direction === 'student-to-group') {
      if (isStudent && status !== 'withdrawn') return res.status(403).json({ message: 'Students can only withdraw' });
      if (!isLeader && !isStudent) return res.status(403).json({ message: 'Not authorized' });
    } else {
      // group-to-student: student accepts/declines
      if (!isStudent) return res.status(403).json({ message: 'Not authorized' });
      if (!['accepted', 'declined'].includes(status)) return res.status(400).json({ message: 'Invalid action' });
    }

    // Accept: add to members
    if (status === 'accepted') {
      if (group.members.length >= group.maxSize) {
        request.status = 'waitlisted';
        await request.save();
        return res.json({ message: 'Group full — added to waitlist', request });
      }

      const profile = await StudentProfile.findOne({ userId: request.studentId });
      group.members.push({
        userId: request.studentId,
        name: request.studentName || profile?.name || 'Student',
        joinedAt: new Date(),
      });

      if (group.members.length >= group.maxSize) {
        group.status = 'full';
        await JoinRequest.updateMany(
          { groupId: group._id, status: 'pending', _id: { $ne: request._id } },
          { status: 'declined' }
        );
      }
      await group.save();
      await StudentProfile.findOneAndUpdate(
        { userId: request.studentId },
        { status: 'inGroup', groupId: group._id }
      );
    }

    request.status = status;
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
