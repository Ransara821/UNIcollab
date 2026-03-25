const mongoose = require("mongoose");

const ResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['lecture-notes', 'past-papers', 'slides', 'assignments', 'other'],
      default: 'other',
    },
    subject: {
      type: String,
      default: '',
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 2,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      default: '',
    },
    originalName: {
      type: String,
      default: '',
    },
    fileType: {
      type: String,
      default: '',
    },
    uploadedBy: {
      type: String,
      default: 'admin',
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", ResourceSchema);