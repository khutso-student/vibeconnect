const dotenvFlow = require("dotenv-flow");
dotenvFlow.config({ node_env: process.env.NODE_ENV || "development" });

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const upload = require("./routes/upload");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/User");
const jwt = require("jsonwebtoken");

connectDB();


const allowedOrigins = [
  process.env.CLIENT_URL,      // frontend URL
  "http://localhost:5173",          
].filter(Boolean); 

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); 
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `❌ CORS blocked: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
};

const app = express();

app.use(cors(corsOptions));

app.use(express.json());




// ✅ Session setup
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

// ✅ Passport setup
app.use(passport.initialize());
app.use(passport.session());

// ✅ Google OAuth setup
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

// ✅ Serve uploaded images
app.use("/uploads", express.static("uploads"));

// ✅ API routes
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/uploads", upload);

// ✅ Google OAuth routes
app.get("/api/users/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/api/users/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  (req, res) => {
    if (!req.user) return res.redirect(`${process.env.CLIENT_URL}/login?error=GoogleAuthFailed`);

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

// ✅ Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    env: process.env.NODE_ENV,
    mongo: !!process.env.MONGO_URI,
    clientUrl: process.env.CLIENT_URL || null,
  });
});

// ✅ Catch-all 404 handler
app.all(/(.*)/, (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT} (${process.env.NODE_ENV})`)
);
