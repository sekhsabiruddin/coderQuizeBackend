const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const User = require("./controller/userController");
const Question = require("./controller/questionController");
const Result = require("./controller/resultController");
require("dotenv").config();
const dbConnect = require("./db/db");
const Feedback = require("./controller/feedbackController");
const Admin = require("./controller/adminController");
const errorMiddleware = require("./middleware/error");
// Middleware
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

app.use(
  cors({
    origin: ["https://code-quize-frontend-trkr.vercel.app"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "50mb" })); // JSON parsing with limit
app.use(express.urlencoded({ extended: true })); // Form data parsing
app.use("/", express.static("uploads")); // Serving static files

// Routes
app.use("/api/user", User);
app.use("/api/question", Question);
app.use("/api/result", Result);
app.use("/api/feedback", Feedback);
app.use("/api/admin", Admin);

//Error Handler Middleware
app.use(errorMiddleware);

// Database Connection
dbConnect();

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
