const mongoose = require("mongoose");

const KuppiClassSchema = new mongoose.Schema(
  {
    title: {
         type: String, 
         required: true 
    },
    module: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
    },
    location: { 
        type: String 
    },
    deadline: { 
        type: Date 
    },
    postedBy: { 
        type: String 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("KuppiClass", KuppiClassSchema);
