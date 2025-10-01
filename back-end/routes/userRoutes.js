const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { signup, login, getUserById, updateUser } = require("../controllers/userController");

// ----------------------
// Google OAuth
// ----------------------
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  (req, res) => {
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=GoogleAuthFailed`);
    }

    // ✅ Sign JWT (same structure as normal login/signup)
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Redirect to frontend with JWT
    res.redirect(`${process.env.CLIENT_URL}/google-redirect?token=${token}`);
  }
);

// ----------------------
// Regular Auth
// ----------------------
router.post("/signup", signup);
router.post("/login", login);
router.get("/:id", getUserById);
router.put("/:id", updateUser);

module.exports = router;
