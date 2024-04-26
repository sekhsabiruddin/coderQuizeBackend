const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Please enter your question"],
  },
  options: [String, String, String, String],
  answer: {
    type: String,
    required: true,
    default: null,
  },
  status: {
    type: String,
    default: null,
  },
  useranswer: {
    type: String,
    default: null,
  },

  useranswerindex: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Question", questionSchema);
