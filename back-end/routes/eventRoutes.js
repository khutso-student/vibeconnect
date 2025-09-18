const express = require("express");
const {
  createEvent,
  getAllEvents,
  likeEvent,
  updateEvent,
  deleteEvent,
  incrementViews // ✅ Use the correct function name
} = require('../controllers/eventController');

const upload = require('../middleware/uploads');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ============================
// PUBLIC ROUTES
// ============================
router.get("/", getAllEvents);
router.patch("/:id/view", incrementViews);// ✅ User must be logged in to view
router.patch("/:id/like", protect, likeEvent); // ✅ User must be logged in to like

// ============================
// ADMIN ONLY ROUTES
// ============================
router.post("/", protect, authorize("admin"), upload.single("image"), createEvent);
router.put("/:id", protect, authorize("admin"), upload.single("image"), updateEvent);
router.delete("/:id", protect, authorize("admin"), deleteEvent);

module.exports = router;
