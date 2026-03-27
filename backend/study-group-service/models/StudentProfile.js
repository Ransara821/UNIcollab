const mongoose = require('mongoose');

const StudentProfileSchema = new mongoose.Schema({
  userId:           { type: String, required: true, unique: true },
  name:             String,
  email:            String,
  year:             { type: Number, enum: [1, 2, 3, 4] },
  faculty:          String,
  skills:           [String],
  workingStyle:     { type: String, enum: ['collaborative', 'independent', 'mixed'], default: 'mixed' },
  availability:     {
    monday:    [String],
    tuesday:   [String],
    wednesday: [String],
    thursday:  [String],
    friday:    [String],
    saturday:  [String],
    sunday:    [String],
  },
  deadline:         Date,
  sosFlag:          { type: Boolean, default: false },
  status:           { type: String, enum: ['lookingForGroup', 'inGroup', 'notLooking'], default: 'lookingForGroup' },
  groupId:          { type: mongoose.Schema.Types.ObjectId, ref: 'StudyGroup' },
  skillVector:      { type: Map, of: Number, default: {} },
  availabilityMatrix: { type: Map, of: Number, default: {} },
  joinRequestCount: { type: Number, default: 0 },
  poolEnteredAt:    { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
