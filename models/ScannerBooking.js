const mongoose = require("mongoose");

const scannerBookingSchema = new mongoose.Schema(
    {
        bookingId: {
            type: String,
            unique: true,
            required: true,
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        countryCode: {
            type: String,
            default: "+91",
        },

        mobile: {
            type: String,
            required: true,
        },

        department: {
            type: String,
            default: "",
        },

        contactMethod: {
            type: String,
            enum: ["Email", "Phone", "Both"],
            required: true,
        },

        date: {
            type: String,
            required: true,
        },

        startTime: {
    type: String,
    required: true,
},

endTime: {
    type: String,
    required: true,
},

        purpose: {
            type: String,
            required: true,
        },

        concerns: {
            type: String,
            default: "",
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },

        adminComment: {
            type: String,
            default: "",
        },

        reviewedBy: {
            type: String,
            default: "",
        },

        reviewedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "ScannerBooking",
    scannerBookingSchema,
    "ScannerBookings"
);