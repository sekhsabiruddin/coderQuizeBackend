const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  myUserId: {
    type: String,
    required: false, // Allow null values
  },
  score: {
    type: Number,
    default: 0,
  },
  solved: {
    type: Number,
    default: 0,
  },
  unsolved: {
    type: Number,
    default: 0,
  },
  not_attend: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Set default value to current date and time
  },
});

const Result = mongoose.model("Result", resultSchema);

module.exports = Result;
