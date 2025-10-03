const express = require("express");
const {
  createEvent,
  getAllEvents,
  likeEvent,
  updateEvent,
  deleteEvent,
  incrementViews,
  getLikedEvents,
} = require("../controllers/eventController");

const upload = require("../middleware/uploads"); // memory-based multer
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Public
router.get("/", getAllEvents);
router.patch("/:id/view", incrementViews);

// Protected (users)
router.get("/liked", protect, getLikedEvents);
router.patch("/:id/like", protect, likeEvent);

// Admin
router.post("/", protect, authorize("admin"), upload.single("image"), createEvent);
router.put("/:id", protect, authorize("admin"), upload.single("image"), updateEvent);
router.delete("/:id", protect, authorize("admin"), deleteEvent);

module.exports = router;
