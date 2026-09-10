const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ScannerAdmin = require("../models/adminmodel");

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        const admin = await ScannerAdmin.findOne({
            email: email.toLowerCase().trim(),
        });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        if (!admin.isActive) {
            return res.status(403).json({
                success: false,
                message: "Admin account is inactive.",
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            admin.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const token = jwt.sign(
            {
                id: admin._id,
                email: admin.email,
                role: admin.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

        return res.status(200).json({
            success: true,
            message: "Admin login successful.",
            token,
            data: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        });
    } catch (error) {
        console.error("Admin login error:", error);

        return res.status(500).json({
            success: false,
            message: "Admin login failed.",
        });
    }
};

const ScannerBooking = require("../models/ScannerBooking");

// Get all scanner bookings
const getScannerBookings = async (req, res) => {
    try {
        const { status, date, search } = req.query;

        const filter = {};

        // Filter by status
        if (status && status !== "all") {
            filter.status = status;
        }

        // Filter by date
        if (date) {
            filter.date = date;
        }

        // Search by name, email or booking ID
        if (search) {
            filter.$or = [
                {
                    fullName: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    email: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    bookingId: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        const bookings = await ScannerBooking.find(filter)
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });
    } catch (error) {
        console.error("Get scanner bookings error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch scanner bookings.",
        });
    }
};


// Get single scanner booking
const getScannerBookingById = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await ScannerBooking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: booking,
        });
    } catch (error) {
        console.error("Get scanner booking error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch booking.",
        });
    }
};


// Approve scanner booking
const approveScannerBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminComment } = req.body;

        const booking = await ScannerBooking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        if (booking.status === "approved") {
            return res.status(400).json({
                success: false,
                message: "Booking is already approved.",
            });
        }

        // Check if another approved booking exists
        const existingApprovedBooking = await ScannerBooking.findOne({
            _id: { $ne: booking._id },
            date: booking.date,
            timeSlot: booking.timeSlot,
            status: "approved",
        });

        if (existingApprovedBooking) {
            return res.status(409).json({
                success: false,
                message:
                    "This scanner slot has already been approved for another booking.",
            });
        }

        booking.status = "approved";
        booking.adminComment = adminComment || "";
        booking.reviewedBy = req.admin.email;
        booking.reviewedAt = new Date();

        await booking.save();

        return res.status(200).json({
            success: true,
            message: "Scanner booking approved successfully.",
            data: booking,
        });
    } catch (error) {
        console.error("Approve scanner booking error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to approve scanner booking.",
        });
    }
};


// Reject scanner booking
const rejectScannerBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminComment } = req.body;

        const booking = await ScannerBooking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        if (booking.status === "rejected") {
            return res.status(400).json({
                success: false,
                message: "Booking is already rejected.",
            });
        }

        booking.status = "rejected";
        booking.adminComment = adminComment || "";
        booking.reviewedBy = req.admin.email;
        booking.reviewedAt = new Date();

        await booking.save();

        return res.status(200).json({
            success: true,
            message: "Scanner booking rejected successfully.",
            data: booking,
        });
    } catch (error) {
        console.error("Reject scanner booking error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to reject scanner booking.",
        });
    }
};

module.exports = {
    adminLogin,
    getScannerBookings,
    getScannerBookingById,
    approveScannerBooking,
    rejectScannerBooking,
};