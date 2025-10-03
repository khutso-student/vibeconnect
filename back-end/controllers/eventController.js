const Event = require("../models/Event");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");

// ============================
// ✅ Base URL for images
// ============================
const PORT = process.env.PORT || 5000;
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://vibeconnect-n570.onrender.com" // replace with your Render URL
    : `http://localhost:${PORT}`;

// ============================
// Helper function to format "time ago"
// ============================
const getTimeAgo = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

// ============================
// Helper: upload buffer to Cloudinary
// ============================
const uploadBufferToCloudinary = (buffer, folder = "events") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });

// ============================
// Helper: save locally (dev)
// ============================
const saveFileLocally = (file) => {
  const uploadsDir = path.join(__dirname, "../uploads/events");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const fileName = `${Date.now()}-${file.originalname}`;
  const filePath = path.join(uploadsDir, fileName);
  fs.writeFileSync(filePath, file.buffer);
  return `/uploads/events/${fileName}`;
};

// ============================
// ✅ Helper: ensure user is authenticated
// ============================
const ensureAuthenticated = (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "User not authenticated" });
    return null;
  }
  return userId;
};

// ============================
// Create Event (Admin only)
// ============================
exports.createEvent = async (req, res) => {
  try {
    const userId = ensureAuthenticated(req, res);
    if (!userId) return;

    const { title, date, time, description, location, category, status } = req.body;
    if (!req.file) return res.status(400).json({ message: "Image is required" });

    let imageUrl = "";
    let imagePublicId = "";

    if (process.env.NODE_ENV === "production") {
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer, "events");
      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    } else {
      imageUrl = `${BASE_URL}${saveFileLocally(req.file)}`;
    }

    const newEvent = await Event.create({
      title,
      date,
      time,
      description,
      location,
      category: category || "General",
      status,
      image: imageUrl,
      imagePublicId: imagePublicId || undefined,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: { ...newEvent.toObject(), postedTime: "just now" },
    });
  } catch (error) {
    console.error("❌ Create Event Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================
// Get All Events (Public)
// ============================
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("createdBy", "name email")
      .populate("likedBy", "name email")
      .sort({ createdAt: -1 });

    const formattedEvents = events.map((event) => {
      let imageUrl = event.image || "";
      if (imageUrl.startsWith("/uploads")) imageUrl = `${BASE_URL}${imageUrl}`;

      return {
        ...event.toObject(),
        image: imageUrl,
        postedTime: getTimeAgo(event.createdAt),
        formattedLikes: event.likes >= 1000 ? (event.likes / 1000).toFixed(1) + "k" : event.likes,
        formattedViews: event.views >= 1000 ? (event.views / 1000).toFixed(1) + "k" : event.views,
      };
    });

    res.json({ success: true, events: formattedEvents });
  } catch (error) {
    console.error("❌ Get Events Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================
// Increment Views
// ============================
exports.incrementViews = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || null;
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    if (!Array.isArray(event.viewedBy)) event.viewedBy = [];

    if (userId) {
      const userView = event.viewedBy.find((v) => v.user?.toString() === userId.toString());
      if (userView) {
        if (userView.count < 2) {
          userView.count += 1;
          event.views += 1;
        }
      } else {
        event.viewedBy.push({ user: userId, count: 1 });
        event.views += 1;
      }
    } else {
      event.views += 1;
    }

    await event.save({ validateBeforeSave: false });

    let imageUrl = event.image || "";
    if (imageUrl.startsWith("/uploads")) imageUrl = `${BASE_URL}${imageUrl}`;

    res.status(200).json({ success: true, views: event.views, event: { ...event.toObject(), image: imageUrl } });
  } catch (error) {
    console.error("❌ Increment Views Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================
// Like/Unlike Event (Toggle)
// ============================
exports.likeEvent = async (req, res) => {
  try {
    const userId = ensureAuthenticated(req, res);
    if (!userId) return;

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!Array.isArray(event.likedBy)) event.likedBy = [];

    const hasLiked = event.likedBy.some((id) => id.toString() === userId.toString());
    if (hasLiked) {
      event.likedBy = event.likedBy.filter((id) => id.toString() !== userId.toString());
    } else {
      event.likedBy.push(userId);
    }

    event.likes = event.likedBy.length;
    await event.save();

    let imageUrl = event.image || "";
    if (imageUrl.startsWith("/uploads")) imageUrl = `${BASE_URL}${imageUrl}`;

    res.status(200).json({
      likes: event.likes,
      likedByUser: !hasLiked,
      event: { ...event.toObject(), image: imageUrl },
    });
  } catch (err) {
    console.error("❌ Error liking event:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// Get Liked Events
// ============================
exports.getLikedEvents = async (req, res) => {
  try {
    const userId = ensureAuthenticated(req, res);
    if (!userId) return;

    const likedEvents = await Event.find({ likedBy: { $in: [userId] } });

    const formattedEvents = likedEvents.map((event) => {
      let imageUrl = event.image || "";
      if (imageUrl.startsWith("/uploads")) imageUrl = `${BASE_URL}${imageUrl}`;
      return { ...event.toObject(), image: imageUrl };
    });

    res.status(200).json(formattedEvents);
  } catch (err) {
    console.error("❌ Get Liked Events Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ============================
// Update Event
// ============================
exports.updateEvent = async (req, res) => {
  try {
    const userId = ensureAuthenticated(req, res);
    if (!userId) return;

    const { title, date, time, description, location, category, status } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (req.file) {
      if (process.env.NODE_ENV === "production") {
        if (event.imagePublicId) {
          try {
            await cloudinary.uploader.destroy(event.imagePublicId);
          } catch (e) {
            console.warn("Cloudinary destroy error:", e.message);
          }
        }
        const uploadResult = await uploadBufferToCloudinary(req.file.buffer, "events");
        event.image = uploadResult.secure_url;
        event.imagePublicId = uploadResult.public_id;
      } else {
        event.image = `${BASE_URL}${saveFileLocally(req.file)}`;
      }
    }

    // Update other fields
    event.title = title ?? event.title;
    event.date = date ?? event.date;
    event.time = time ?? event.time;
    event.description = description ?? event.description;
    event.location = location ?? event.location;
    event.category = category ?? event.category;
    event.status = status ?? event.status;

    await event.save();

    let imageUrl = event.image || "";
    if (imageUrl.startsWith("/uploads")) imageUrl = `${BASE_URL}${imageUrl}`;

    res.json({ success: true, message: "Event updated", event: { ...event.toObject(), image: imageUrl } });
  } catch (error) {
    console.error("❌ Update Event Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================
// Delete Event
// ============================
exports.deleteEvent = async (req, res) => {
  try {
    const userId = ensureAuthenticated(req, res);
    if (!userId) return;

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (process.env.NODE_ENV === "production" && event.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(event.imagePublicId);
      } catch (e) {
        console.warn("Cloudinary destroy error:", e.message);
      }
    }

    await event.deleteOne();
    res.json({ success: true, message: "Event deleted" });
  } catch (error) {
    console.error("❌ Delete Event Error:", error);
    res.status(500).json({ message: error.message });
  }
};
