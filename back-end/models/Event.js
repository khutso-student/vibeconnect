const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed"],
      default: "Upcoming",
    },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // ✅ New fields
    views: { type: Number, default: 0 },
    viewedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        count: { type: Number, default: 0 },
      },
    ],

    image: { type: String, required: true },

    // ✅ Track who created the event
    // Make optional to prevent errors on old events
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  },
  { timestamps: true }
);

// Virtual for formatted likes
eventSchema.virtual("formattedLikes").get(function () {
  return this.likes >= 1000 ? (this.likes / 1000).toFixed(1) + "k" : this.likes;
});

module.exports = mongoose.model("Event", eventSchema);
