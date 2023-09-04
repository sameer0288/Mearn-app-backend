const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const User = require("./models/user");
const secretKey = "your-secret-key";

// Register API
router.post("/register", async (req, res) => {
  try {
    const { name, dateOfBirth, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      name,
      dateOfBirth,
      email,
      password,
      role: "user",
    });

    await user.save();

    // Generate and send a JWT token
    const token = jwt.sign({ email: user.email, userId: user._id }, secretKey, {
      expiresIn: "36500d",
    });

    res.status(201).json({ message: "Registration successful", token });
    console.log("Registration successful-->", user);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

// Login API
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // If user not found or password is incorrect
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // Generate and send a JWT token
    const token = jwt.sign({ email: user.email, userId: user._id }, secretKey, {
      expiresIn: "36500d",
    });

    res.status(200).json({ message: "Login successful", token });
    console.log("Login successful-->", user);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

// Get User Data
router.get("/userdata", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, secretKey);

    if (!decodedToken) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // Retrieve user data from the database
    const userData = await User.find();

    res.status(200).json(userData);
  } catch (error) {
    console.error("User data error:", error);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

// Update User Data API
router.put("/userdata/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUserData = req.body;

    // Find the user by ID and update their data
    const updatedUser = await User.findByIdAndUpdate(id, updatedUserData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
    console.log("Updated User-->", updatedUser);
  } catch (error) {
    console.error("Update user data error:", error);
    res.status(500).json({ message: "Error updating user data" });
  }
});

// Export the router
module.exports = router;
