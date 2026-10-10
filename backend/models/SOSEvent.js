
const mongoose = require("mongoose");

const sosEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: "TRIGGERED",
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    battery: {
      type: Number,
      default: null,
    },
    message: {
      type: String,
      default: "SOS alert triggered from parent app",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.SOSEvent ||
  mongoose.model("SOSEvent", sosEventSchema);

