const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  groupId:    { type: mongoose.Schema.Types.ObjectId, ref: 'StudyGroup', required: true },
  authorId:   { type: String, required: true },
  authorName: { type: String, required: true },
  content:    { type: String, required: true, maxlength: 1000 },
  type:       { type: String, enum: ['update', 'reminder'], default: 'update' },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
