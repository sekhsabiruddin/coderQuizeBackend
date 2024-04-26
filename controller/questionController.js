const express = require("express");
const router = express.Router();
const Question = require("../model/question"); // Renamed to uppercase 'Question' for clarity
const path = require("path");
const { upload } = require("../multer");
const sendToken = require("../utils/jwtToken");
const jwt = require("jsonwebtoken");

//=============================Get all Questin======================
router.get("/get-all-questions", async (req, res) => {
  try {
    const allQuestions = await Question.find();
    if (!allQuestions || allQuestions.length === 0) {
      return res.status(404).json({ error: "No questions found" });
    }

    res.status(200).json(allQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
//=============================Random Questin======================
router.get("/get-random-question", async (req, res, next) => {
  try {
    let randomQuestions;

    // Retrieve all questions from the database
    const allQuestions = await Question.find();

    if (allQuestions.length <= 16) {
      // If there are 16 or fewer questions, shuffle the array
      randomQuestions = shuffleArray(allQuestions);
    } else {
      // If there are more than 16 questions, retrieve 16 random questions
      const totalQuestions = allQuestions.length;
      const skip = Math.floor(Math.random() * totalQuestions);
      randomQuestions = await Question.find().skip(skip).limit(16);
    }

    res.json(randomQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Function to shuffle an array
function shuffleArray(array) {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

//===========================add-question==========================
router.post("/add-question", async (req, res, next) => {
  const { question, options, answer, questiontype } = req.body;

  try {
    const newQuestion = new Question({
      question: question,
      options: options,
      answer: answer,
      questiontype: questiontype,
    });
    const savedQuestion = await newQuestion.save();
    res.json(savedQuestion);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/edit-question/:questionId", async (req, res, next) => {
  const { question, options, answer, questiontype } = req.body;
  const questionId = req.params.questionId;

  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      {
        question: question,
        options: options,
        answer: answer,
        questiontype: questiontype,
      },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/delete-question/:questionId", async (req, res, next) => {
  const questionId = req.params.questionId;
  try {
    const deletedQuestion = await Question.findByIdAndDelete(questionId);
    if (!deletedQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
