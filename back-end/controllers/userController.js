const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const passport = require("passport");

// --------------------
// Normal Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// --------------------
// Normal Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Incorrect password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// --------------------
// Get User by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Get User Error:", error.message);
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
};

// --------------------
// Update User
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Only allow self-update OR admin
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Cannot update this profile" });
    }

    const { name, email, role, profileImage } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, role, profileImage },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Update Error:", error.message);
    res.status(500).json({ message: "Failed to update user profile", error: error.message });
  }
};


// --------------------
// Google OAuth (Passport)
exports.googleAuth = passport.authenticate("google", { scope: ["profile", "email"] });

exports.googleCallback = (req, res, next) => {
  passport.authenticate("google", { failureRedirect: "/login" })(req, res, async () => {
    try {
      const user = req.user;
      if (!user) return res.redirect(`${process.env.CLIENT_URL}/login?error=GoogleAuthFailed`);

      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.redirect(`${process.env.CLIENT_URL}/google-redirect?token=${token}`);
    } catch (error) {
      console.error("Google callback error:", error.message);
      res.redirect(`${process.env.CLIENT_URL}/login?error=GoogleAuthFailed`);
    }
  });
};
