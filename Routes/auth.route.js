const express = require("express");
const userRouter = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../Model/user.model");
const { validation } = require("../Validators/validator");

// Route to register a new user
userRouter.post("/register", validation, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the username is already registered
    const isUserPresent = await UserModel.findOne({ username });
    if (isUserPresent) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new UserModel({
      username,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


// Route to log in
userRouter.post("/login", validation, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the username is present or not
    const isUserPresent = await UserModel.findOne({ username });
    if (!isUserPresent) {
      return res.status(400).json({ success: false, message: 'User not present' });
    }

    // Find the user in the database
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);

    // Set the token in a cookie
    res.cookie('authToken', token, { httpOnly: true });

    res.status(200).json({ success: true, message: 'Login successful',authToken:token,user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Route to log out
userRouter.post("/logout", (req, res) => {
  // Clear the token cookie
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logout successful' });
});

module.exports = { userRouter };
