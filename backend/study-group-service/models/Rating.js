const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  fromUserId: { type: String, required: true },
  toUserId:   { type: String, required: true },
  groupId:    { type: mongoose.Schema.Types.ObjectId, ref: 'StudyGroup', required: true },
  score:      { type: Number, required: true, min: 1, max: 5 },
  comment:    { type: String, maxlength: 300, default: '' },
}, { timestamps: true });

// One rating per rater-ratee pair per group (upsertable)
RatingSchema.index({ fromUserId: 1, toUserId: 1, groupId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', RatingSchema);
