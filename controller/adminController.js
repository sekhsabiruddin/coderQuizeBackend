// Import necessary modules
const express = require("express");
const router = express.Router();
const Admin = require("../model/admin");
const jwt = require("jsonwebtoken");
const isAuthenticatedAdmin = require("../middleware/adminAuth");
const { upload } = require("../multer");
router.post("/create-admin", async (req, res) => {
  try {
    const { email, password, phoneNumber, address, avatar } = req.body;

    // Create a new admin document
    const admin = new Admin({
      email,
      password,
      phoneNumber,
      address,
      avatar,
    });

    await admin.save();

    res.status(201).send("Account created successfully");
  } catch (error) {
    res.status(500).send("Error creating account");
  }
});

// Route for user login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).send("Admin not found");
    }

    // Check if the entered password matches the hashed password
    const isPasswordMatch = await admin.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).send("Invalid password");
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: admin._id,
        email: admin.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    res.cookie("AdminToken", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ error: error.message });
  }
});

router.put(
  "/update-admin",
  upload.single("file"), // Upload middleware
  isAuthenticatedAdmin,
  async (req, res) => {
    try {
      const admin = await Admin.findById(req.Admin.id);

      if (!admin) {
        return res.status(400).json({ message: "Admin doesn't exist" });
      }

      // Extract updated admin details from the request body
      const { name, email, phoneNumber, address } = req.body;
      console.log("Name", name);
      // Update admin details
      admin.name = name || admin.name;
      admin.email = email || admin.email;
      admin.phoneNumber = phoneNumber || admin.phoneNumber;
      admin.address = address || admin.address;

      // Handle avatar update
      if (req.file) {
        if (admin.avatar) {
          const previousAvatarPath = path.join(
            __dirname,
            "../uploads/",
            admin.avatar
          );
          if (fs.existsSync(previousAvatarPath)) {
            fs.unlinkSync(previousAvatarPath);
          }
        }
        admin.avatar = req.file.filename;
      }

      await admin.save();

      res
        .status(200)
        .json({ message: "Admin details updated successfully", admin });
    } catch (error) {
      // Handle errors
      console.error("Error updating admin:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Route for retrieving admin details
router.get("/get-admin", isAuthenticatedAdmin, async (req, res) => {
  try {
    // Admin user information is stored in req.Admin by the isAuthenticatedAdmin middleware
    const admin = req.Admin;
    if (!admin) {
      return res.status(404).send("Admin not found");
    }

    res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("AdminToken");
  res.send("Logged out successfully");
});
router.post("/change-password", isAuthenticatedAdmin, async (req, res) => {
  try {
    const { oldPassword, password, confirmPassword } = req.body;

    // Check if new password and confirm password match
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password don't match" });
    }

    // Fetch the user from the database
    const admin = await Admin.findById(req.Admin.id);

    if (!admin) {
      return res.status(400).json({ message: "User doesn't exist" });
    }

    const isPasswordMatched = await admin.comparePassword(oldPassword);

    if (!isPasswordMatched) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Hash the new password

    // Update the user's password in the database
    admin.password = password;
    await admin.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
