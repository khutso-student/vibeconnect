const express = require('express');
const multer = require('multer');
const User = require('../models/User');

const router = express.Router();

// Use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload-profile/:id", upload.single("image"), async (req, res) => {
    try {
        const userId = req.params.id;

        if (!req.file) {
            return res.status(400).json({ error: "No image file uploaded" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const imageBuffer = req.file.buffer;
        const base64Image = imageBuffer.toString("base64");
        const mimeType = req.file.mimetype;
        const profileImage = `data:${mimeType};base64,${base64Image}`;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profileImage },
            { new: true }
        );

        // Respond with updated user directly
        res.status(200).json(updatedUser);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to upload profile image" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email, role } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email, role },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Respond with updated user directly
        res.status(200).json(updatedUser);

    } catch (error) {
        console.error("Update Error:", error.message);
        res.status(500).json({ error: 'Failed to update user profile' });
    }
});


module.exports = router;