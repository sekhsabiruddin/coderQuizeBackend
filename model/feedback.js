const mongoose = require("mongoose");

const jwt = require("jsonwebtoken");

const feedbackSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, "Please enter your question"],
  },

  message: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Feedback", feedbackSchema);
