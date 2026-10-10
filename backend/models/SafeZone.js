const mongoose = require("mongoose");

const safeZoneSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },

        latitude: {
            type: Number,
            required: true,
        },

        longitude: {
            type: Number,
            required: true,
        },

        radius: {
            type: Number,
            required: true,
        },

        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("SafeZone", safeZoneSchema);