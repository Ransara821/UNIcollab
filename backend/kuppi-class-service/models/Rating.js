const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema(
  {
    kuppiClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KuppiClass',
      required: true,
    },
    ratedBy: { type: String, required: true },   // userId of the student who rated
    hostId:  { type: String, required: true },   // userId of the session host (postedById)
    rating:  { type: Number, min: 1, max: 5, required: true },
  },
  { timestamps: true }
);

// One rating per student per session
RatingSchema.index({ kuppiClassId: 1, ratedBy: 1 }, { unique: true });

module.exports = mongoose.model('Rating', RatingSchema);
