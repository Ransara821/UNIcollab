const Announcement = require('../models/Announcement');
const StudyGroup   = require('../models/StudyGroup');

// GET /:groupId/announcements — any member of the group
exports.getAnnouncements = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isMember = group.members.some(m => m.userId === req.user.id);
    const isLeader = group.leader === req.user.id;
    if (!isMember && !isLeader) return res.status(403).json({ message: 'Not a member of this group' });

    const announcements = await Announcement.find({ groupId: req.params.id }).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /:groupId/announcements — leader only
exports.createAnnouncement = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.leader !== req.user.id) return res.status(403).json({ message: 'Only the group leader can post announcements' });

    const { content, type } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Content is required' });

    const announcement = await Announcement.create({
      groupId:    group._id,
      authorId:   req.user.id,
      authorName: req.user.name,
      content:    content.trim(),
      type:       type || 'update',
    });
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /:groupId/announcements/:annId — leader only
exports.deleteAnnouncement = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.leader !== req.user.id) return res.status(403).json({ message: 'Only the group leader can delete announcements' });

    await Announcement.findOneAndDelete({ _id: req.params.annId, groupId: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
