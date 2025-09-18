const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Fallback if MONGO_URI not defined in env
    const mongoUri =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/VibeConnect";

    const conn = await mongoose.connect(mongoUri);

    console.log("✅ MongoDB Connected:");
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   DB:   ${conn.connection.name}`);
    console.log(`   ENV:  ${process.env.NODE_ENV || "development"}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;