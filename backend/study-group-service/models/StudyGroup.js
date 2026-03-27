const mongoose = require('mongoose');

const StudyGroupSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  groupNumber:   { type: String, trim: true },
  subject:       String,
  description:   String,
  requiredSkills: [String],
  skillVector:   { type: Map, of: Number, default: {} },
  workingStyle:  { type: String, enum: ['collaborative', 'independent', 'mixed'], default: 'mixed' },
  maxSize:       { type: Number, default: 5 },
  leader:        { type: String, required: true },
  members: [{
    userId:   String,
    name:     String,
    joinedAt: { type: Date, default: Date.now },
  }],
  status:        { type: String, enum: ['open', 'full', 'closed'], default: 'open' },
  deadline:      Date,
  skillsNeeded:  String,
}, { timestamps: true });

StudyGroupSchema.index({ name: 'text', description: 'text', subject: 'text' });

module.exports = mongoose.model('StudyGroup', StudyGroupSchema);
