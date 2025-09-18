const Event = require('../models/Event');

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
// @desc    Create Event (Admin only)
// @route   POST /api/events
// ============================
exports.createEvent = async (req, res) => {
  try {
    const { title, date, time, description, location, category, status } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const newEvent = await Event.create({
      title,
      date,
      time,
      description,
      location,
      category,
      status,
      image: `/uploads/${req.file.filename}`
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: {
        ...newEvent.toObject(),
        postedTime: "just now"
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================
// @desc    Get All Events (Public)
// @route   GET /api/events
// ============================
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });

    const formattedEvents = events.map(event => ({
      ...event.toObject(),
      postedTime: getTimeAgo(event.createdAt),
      formattedLikes: event.likes >= 1000 ? (event.likes / 1000).toFixed(1) + "k" : event.likes,
      formattedViews: event.views >= 1000 ? (event.views / 1000).toFixed(1) + "k" : event.views
    }));

    res.json({ success: true, events: formattedEvents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================
// @desc    Increment Event Views (Unique Users)
// @route   PATCH /api/events/:id/view
exports.incrementViews = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id; // optional, undefined if guest

    const event = await Event.findById(id);
    if (!event) 
      return res.status(404).json({ success: false, message: "Event not found" });

    if (userId) {
      // track user-specific views
      const userView = event.viewedBy.find(v => v.user.toString() === userId.toString());
      if (userView) {
        if (userView.count < 2) { // optional limit per user
          userView.count += 1;
          event.views += 1;
        }
      } else {
        event.viewedBy.push({ user: userId, count: 1 });
        event.views += 1;
      }
    } else {
      // guest view increments once
      event.views += 1;
    }

    await event.save();
    res.status(200).json({ success: true, views: event.views });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ============================
// @desc    Like/Unlike Event (toggle)
// @route   PATCH /api/events/:id/like
// ============================
exports.likeEvent = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "User not authenticated" });

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const userId = req.user.id.toString();

    if (event.likedBy.includes(userId)) {
      event.likedBy = event.likedBy.filter(id => id.toString() !== userId);
    } else {
      event.likedBy.push(userId);
    }

    event.likes = event.likedBy.length;
    await event.save();

    res.status(200).json({
      likes: event.likes,
      likedByUser: event.likedBy.includes(userId),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// @desc    Update Event (Admin only)
// @route   PUT /api/events/:id
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
    res.status(500).json({ message: error.message });
  }
};

// ============================
// @desc    Delete Event (Admin only)
// @route   DELETE /api/events/:id
// ============================
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    res.json({ success: true, message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
