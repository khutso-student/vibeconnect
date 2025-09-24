const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum:["user", "admin"], default: "user" },
    profileImage: { type: String,  default: "",}, 

    password: { type: String },  
    googleId: { type: String },
    avatar: { type: String },  
}, { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);