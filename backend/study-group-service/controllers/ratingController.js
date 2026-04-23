const Rating     = require('../models/Rating');
const StudyGroup = require('../models/StudyGroup');

// POST /:id/ratings — submit or update a rating for a group member
exports.submitRating = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.status !== 'closed')
      return res.status(400).json({ message: 'Ratings are only open after the project ends (group must be closed)' });

    const isMember = group.leader === req.user.id || group.members.some(m => m.userId === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'Not a member of this group' });

    const { toUserId, score, comment } = req.body;
    if (!toUserId) return res.status(400).json({ message: 'toUserId is required' });
    if (toUserId === req.user.id) return res.status(400).json({ message: 'You cannot rate yourself' });

    const targetIsMember = group.leader === toUserId || group.members.some(m => m.userId === toUserId);
    if (!targetIsMember) return res.status(400).json({ message: 'Target user is not a member of this group' });

    const parsedScore = parseInt(score);
    if (!parsedScore || parsedScore < 1 || parsedScore > 5)
      return res.status(400).json({ message: 'Score must be between 1 and 5' });

    const rating = await Rating.findOneAndUpdate(
      { fromUserId: req.user.id, toUserId, groupId: group._id },
      { score: parsedScore, comment: comment?.trim() || '' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(rating);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /:id/ratings — ratings the current user has submitted for this group
exports.getGroupRatings = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isMember = group.leader === req.user.id || group.members.some(m => m.userId === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'Not a member of this group' });

    const submitted = await Rating.find({ groupId: req.params.id, fromUserId: req.user.id });
    res.json(submitted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /ratings/me — all ratings received by the current user + average
exports.getMyRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ toUserId: req.user.id });
    const average = ratings.length
      ? parseFloat((ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(1))
      : null;
    res.json({ ratings, average, count: ratings.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
