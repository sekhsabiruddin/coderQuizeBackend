const express = require("express");
const router = express.Router();
const Result = require("../model/result");
const isAuthenticatedUser = require("../middleware/auth");
const ErrorHandler = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
//====================================CREATE RESULT START================================
router.post(
  "/create-result",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { myUserId, score, solved, unsolved, not_attend } = req.body;

      // Create a new Result document
      const result = new Result({
        myUserId,
        score,
        solved,
        unsolved,
        not_attend,
      });

      // Save the result to the database
      await result.save();

      res.status(201).json({ message: "Result created successfully" });
    } catch (error) {
      console.error("Error creating result:", error);
      next(new ErrorHandler(500, error.message || "Internal Server Error"));
    }
  })
);
//====================================CREATE RESULT END==================================
//====================================GET THE  RESULT START==============================
router.get(
  "/get-result",
  isAuthenticatedUser,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const myUserId = req.user._id;

      const results = await Result.find({ myUserId });

      res.status(200).json({ results });
    } catch (error) {
      console.error("Error getting result:", error);
      next(new ErrorHandler(500, error.message || "Internal Server Error"));
    }
  })
);
//====================================GET THE  RESULT END================================
module.exports = router;
