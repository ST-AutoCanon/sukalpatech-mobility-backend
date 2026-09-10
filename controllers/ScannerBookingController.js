const ScannerBooking = require("../models/ScannerBooking");

const createScannerBooking = async (req, res) => {
    try {
        const {
            fullName,
            email,
            countryCode,
            mobile,
            department,
            contactMethod,
            date,
            startTime,
            endTime,
            purpose,
            concerns,
            requestAnyway
        } = req.body;

        if (
            !fullName ||
            !email ||
            !mobile ||
            !contactMethod ||
            !date ||
            !startTime ||
            !endTime ||
            !purpose
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields.",
            });
        }

        const existingBooking = await ScannerBooking.findOne({
            date,
            startTime,
            endTime,
            status: {
                $in: ["pending", "approved"],
            },
        });

        if (existingBooking && !requestAnyway) {
            return res.status(409).json({
                success: false,
                message:
                    "This scanner slot is already reserved or waiting for approval.",
            });
        }

        const bookingId = `SCN-${Date.now()}`;

        const booking = await ScannerBooking.create({
            bookingId,
            fullName,
            email,
            countryCode,
            mobile,
            department,
            contactMethod,
            date,
            startTime,
            endTime,
            purpose,
            concerns,
            status: "pending",
        });

        return res.status(201).json({
            success: true,
            message: "Scanner booking request submitted successfully.",
            data: booking,
        });
    } catch (error) {
        console.error("Create scanner booking error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to submit scanner booking request.",
        });
    }
};


const getScannerAvailability = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Start date and end date are required.",
            });
        }

        const bookings = await ScannerBooking.find({
            date: {
                $gte: startDate,
                $lte: endDate,
            },
            status: {
                $in: ["pending", "approved"],
            },
        })
            .select(
                "bookingId fullName email mobile department contactMethod date startTime endTime purpose concerns status"
            )
            .sort({ date: 1, startTime: 1 });

        return res.status(200).json({
            success: true,
            data: bookings,
        });
    } catch (error) {
        console.error("Get scanner availability error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch scanner availability.",
        });
    }
};


module.exports = {
    createScannerBooking,
    getScannerAvailability,
};