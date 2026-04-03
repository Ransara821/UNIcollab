const mongoose = require('mongoose');

const JoinRequestSchema = new mongoose.Schema({
  groupId:      { type: mongoose.Schema.Types.ObjectId, ref: 'StudyGroup', required: true },
  studentId:    { type: String, required: true },
  studentName:  String,
  studentEmail: String,
  direction:    { type: String, enum: ['student-to-group', 'group-to-student'], default: 'student-to-group' },
  status:       { type: String, enum: ['pending', 'accepted', 'declined', 'withdrawn', 'waitlisted'], default: 'pending' },
  message:      String,
}, { timestamps: true });

module.exports = mongoose.model('JoinRequest', JoinRequestSchema);
