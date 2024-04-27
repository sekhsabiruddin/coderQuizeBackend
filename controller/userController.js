const express = require("express");
const router = express.Router();
const User = require("../model/user");
const path = require("path");
const { upload } = require("../multer");
const sendToken = require("../utils/jwtToken");
const jwt = require("jsonwebtoken");
const isAuthenticatedUser = require("../middleware/auth");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const fs = require("fs");
//=======================Create User Start============================
router.post(
  "/create-user",
  upload.single("file"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const fileUrl = req.file ? req.file.filename : null;
      const newUser = new User({
        name,
        email,
        password,
        avatar: fileUrl,
      });
      await newUser.save();
      res
        .status(201)
        .json({ message: "User created successfully", user: newUser });
    } catch (error) {
      next(new ErrorHander(error.message, 500));
    }
  })
);
//=======================Create User End===============================
//=======================LogIn User Start==============================
router.post(
  "/login-user",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide email and password",
        });
      }

      const user = await User.findOne({ email }).select("+password");
      console.log("user", user);
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }

      const isPasswordMatched = await user.comparePassword(password);
      console.log("isPasswordMatched", isPasswordMatched);
      if (!isPasswordMatched) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }
      console.log("Hi");
      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );
      res.cookie("token", token, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true,
      });

      res.status(200).json({ success: true, token });
    } catch (error) {
      next(new ErrorHander(error.message, 500));
    }
  })
);
//=======================LogIn User End==============================
//=======================Get User Start===============================
router.get(
  "/getuser",
  isAuthenticatedUser,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(400).json({ message: "User doesn't exist" });
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      next(new ErrorHander(error.message, 500));
    }
  })
);
//=======================Get User End===============================
//change password
router.post("/change-password", isAuthenticatedUser, async (req, res) => {
  try {
    const { oldPassword, password, confirmPassword } = req.body;

    // Check if new password and confirm password match
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password don't match" });
    }

    // Fetch the user from the database
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(400).json({ message: "User doesn't exist" });
    }

    const isPasswordMatched = await user.comparePassword(oldPassword);

    if (!isPasswordMatched) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Hash the new password

    // Update the user's password in the database
    user.password = password;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//=======================Update User Start===============================
router.put(
  "/update-user",
  upload.single("file"), // Upload middleware
  isAuthenticatedUser,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(400).json({ message: "User doesn't exist" });
      }

      // Extract updated user details from the request body
      const { name, email, phoneNumber, address } = req.body;

      // Update user details
      user.name = name || user.name;
      user.email = email || user.email;
      user.phoneNumber = phoneNumber || user.phoneNumber;
      user.address = address || user.address;

      // Handle avatar update
      if (req.file) {
        // If a new file is uploaded, delete the previous avatar if it exists
        if (user.avatar) {
          // Construct the path to the previous avatar
          const previousAvatarPath = path.join(
            __dirname,
            "../uploads/",
            user.avatar
          );
          // Check if the file exists
          if (fs.existsSync(previousAvatarPath)) {
            // If the file exists, delete it
            fs.unlinkSync(previousAvatarPath);
          }
        }
        // Update the avatar with the new file's filename
        user.avatar = req.file.filename;
      }

      // Save updated user details
      await user.save();

      // Respond with success message and updated user details
      res
        .status(200)
        .json({ message: "User details updated successfully", user });
    } catch (error) {
      // Handle errors
      next(new ErrorHander(error.message, 500));
    }
  }
);

//=======================Update User End===============================
//=======================logout User Start===============================
router.post(
  "/logout",
  isAuthenticatedUser,
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.clearCookie("token");
      console.log("Token cleared");
      res.status(200).json({ success: true, message: "Logout successful" });
    } catch (error) {
      next(new ErrorHander(error.message, 500));
    }
  })
);

//=======================logout User End=============================
module.exports = router;
