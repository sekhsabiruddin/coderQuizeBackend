const express = require("express");
const router = express.Router();
const Feedback = require("../model/feedback");
const User = require("../model/user");
const isAuthenticatedUser = require("../middleware/auth");
//====================================CREATE FEEDBACK START================================
router.post("/create-feedback", isAuthenticatedUser, async (req, res) => {
  try {
    const { subject, message } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const newFeedback = new Feedback({
      subject: subject,
      message: message,
      username: user.name,
    });
    await newFeedback.save();
    res
      .status(201)
      .json({ success: true, message: "Feedback created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
//====================================CREATE FEEDBACK END================================
//====================================GET ALL FEEDBACK START================================
router.get("/all-feedback", async (req, res) => {
  try {
    const allFeedback = await Feedback.find();
    if (!allFeedback) {
      return res.status(404).json({ error: "No feedback found" });
    }
    res.status(200).json(allFeedback);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
//====================================GET ALLL FEEDBACK END================================
module.exports = router;
