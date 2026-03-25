const mongoose = require("mongoose");

const EnrollmentSchema = new mongoose.Schema(
  {
    studentId: { 
        type: String, 
        required: true 
    },
    studentName: { 
        type: String, 
        required: true 
    },
    kuppiClassId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "KuppiClass", 
        required: true 
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Enrollment", EnrollmentSchema);
