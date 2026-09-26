const mongoose = require("mongoose");

const blockedSlotSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      trim: true,
    },

    startTime: {
      type: String,
      default: "",
      trim: true,
    },

    endTime: {
      type: String,
      default: "",
      trim: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },

    blockedBy: {
      type: String,
      default: "Scanner Admin",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "BlockedSlot",
  blockedSlotSchema,
  "BlockedSlot"
);