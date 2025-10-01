const Event = require("../models/Event");
const User = require("../models/User");

// Helper function to format "time ago"
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
// Create Event (Admin only)
// ============================
exports.createEvent = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const { title, date, time, description, location, category, status } = req.body;
    if (!req.file) return res.status(400).json({ message: "Image is required" });

    const newEvent = await Event.create({
      title,
      date,
      time,
      description,
      location,
      category: category || "General",
      status,
      image: `/uploads/${req.file.filename}`,
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

    const formattedEvents = events.map((event) => ({
      ...event.toObject(),
      postedTime: getTimeAgo(event.createdAt),
      formattedLikes: event.likes >= 1000 ? (event.likes / 1000).toFixed(1) + "k" : event.likes,
      formattedViews: event.views >= 1000 ? (event.views / 1000).toFixed(1) + "k" : event.views,
    }));

    res.json({ success: true, events: formattedEvents });
  } catch (error) {
    console.error("❌ Get Events Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================
// Increment Event Views (Unique Users)
// ============================
exports.incrementViews = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;

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
      event.views += 1; // guest view
    }

    await event.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, views: event.views });
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
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

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

    res.status(200).json({
      likes: event.likes,
      likedByUser: !hasLiked,
    });
  } catch (err) {
    console.error("❌ Error liking event:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getLikedEvents = async (req, res) => {
  try {
    const likedEvents = await Event.find({ likedBy: { $in: [req.user._id] } });
    res.status(200).json(likedEvents);
  } catch (err) {
    console.error("❌ Get Liked Events Error:", err);
    res.status(500).json({ message: err.message });
  }
};





// ============================
// Update Event (Admin only)
// ============================
exports.updateEvent = async (req, res) => {
  try {
    const { title, date, time, description, location, category, status } = req.body;
    const updateData = { title, date, time, description, location, category, status };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedEvent) return res.status(404).json({ message: "Event not found" });

    res.json({ success: true, message: "Event updated", event: updatedEvent });
  } catch (error) {
    console.error("❌ Update Event Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================
// Delete Event (Admin only)
// ============================
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    res.json({ success: true, message: "Event deleted" });
  } catch (error) {
    console.error("❌ Delete Event Error:", error);
    res.status(500).json({ message: error.message });
  }
};
