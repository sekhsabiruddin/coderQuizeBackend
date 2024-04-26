const express = require("express");
const router = express.Router();
const Feedback = require("../model/feedback");
const User = require("../model/user");
const isAuthenticatedUser = require("../middleware/auth");

router.post("/create-feedback", isAuthenticatedUser, async (req, res) => {
  console.log("Feedback: ", req.body);
  try {
    const { subject, message } = req.body;
    const userId = req.user._id;
    console.log("userId user", userId);
    // Find the user's name using the userId
    const user = await User.findById(userId);
    console.log("Entire user", user);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create a new feedback document
    const newFeedback = new Feedback({
      subject: subject,
      message: message,
      username: user.name, // Assuming there's a 'name' field in the User model
    });
    console.log("Feedbck object: ", newFeedback);
    // Save the feedback document
    await newFeedback.save();

    res
      .status(201)
      .json({ success: true, message: "Feedback created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/all-feedback", async (req, res) => {
  try {
    // Fetch all feedback documents from the database
    const allFeedback = await Feedback.find();

    // If there are no feedback documents found, return an empty array
    if (!allFeedback) {
      return res.status(404).json({ error: "No feedback found" });
    }

    // If feedback documents are found, return them
    res.status(200).json(allFeedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
