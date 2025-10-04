// Load environment variables
const dotenvFlow = require("dotenv-flow");
dotenvFlow.config({ node_env: process.env.NODE_ENV || "development" });

const PORT = process.env.PORT || 5000; // define PORT early

// Base URL for serving images (used in eventController)
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://vibeconnect-n570.onrender.com"  // your Render backend URL
    : `http://localhost:${PORT}`;


const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const uploadRoutes = require("./routes/upload");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/User");
const jwt = require("jsonwebtoken");

// ============================
// ✅ Ensure uploads folder exists (including events)
// ============================
const uploadsDir = path.join(__dirname, "uploads");
const eventsUploadsDir = path.join(uploadsDir, "events");
if (!fs.existsSync(eventsUploadsDir)) {
  fs.mkdirSync(eventsUploadsDir, { recursive: true });
  console.log("📂 Created missing uploads/events folder.");
}

// ============================
// ✅ Connect to MongoDB
// ============================
connectDB();

// ============================
// ✅ CORS
// ============================
const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173"].filter(Boolean);
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman or server-to-server
    if (!allowedOrigins.includes(origin)) {
      console.warn("❌ CORS Blocked:", origin);
      return callback(new Error(`CORS not allowed from ${origin}`), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const app = express();

// ============================
// ✅ Middleware
// ============================
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ============================
// ✅ Session setup
// ============================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// ============================
// ✅ Passport & Google OAuth
// ============================
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            role: "user",
          });
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ============================
// ✅ Serve uploaded files
// ============================
app.use("/uploads", express.static(uploadsDir));

// ============================
// ✅ API routes
// ============================
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/uploads", uploadRoutes);

// ============================
// ✅ Google OAuth routes
// ============================
app.get("/api/users/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/api/users/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  (req, res) => {
    if (!req.user)
      return res.redirect(`${process.env.CLIENT_URL}/login?error=GoogleAuthFailed`);

    const token = jwt.sign(
      {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role || "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.redirect(`${process.env.CLIENT_URL}/google-redirect?token=${token}`);
  }
);

// ============================
// ✅ Health check
// ============================
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    env: process.env.NODE_ENV,
    mongo: !!process.env.MONGO_URI,
    clientUrl: process.env.CLIENT_URL || null,
  });
});



// ============================
// ✅ Catch-all 404
// ============================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ============================
// ✅ Global error handler
// ============================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

// ============================
// ✅ Start server
// ============================
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT} (${process.env.NODE_ENV})`)
);
