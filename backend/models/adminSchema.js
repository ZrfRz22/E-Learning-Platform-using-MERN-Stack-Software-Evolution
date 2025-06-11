const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "Admin"
    },
    collegeName: {
        type: String,
        unique: true,
        required: true
    },
    profilePic: {
        type: String, // Store file path of the profile picture image
        default: "../../frontend/src/assets/default-avatar.jpg"   // Default profile picture image file path
    }
});

module.exports = mongoose.model("admin", adminSchema)