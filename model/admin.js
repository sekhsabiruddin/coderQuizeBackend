const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "Please enter your email!"],
  },
  password: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  address: {
    type: String,
  },
  avatar: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// jwt token
AdminSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// compare password
AdminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Admin", AdminSchema);
