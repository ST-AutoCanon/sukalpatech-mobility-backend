const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ScannerAdmin = require("../models/adminmodel");

const timeToMinutes = (time) => {
    if (!time) return NaN;

    const match = time.match(
        /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
    );

    if (!match) return NaN;

    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const period = match[3].toUpperCase();

    if (period === "AM" && hours === 12) {
        hours = 0;
    }

    if (period === "PM" && hours !== 12) {
        hours += 12;
    }

    return hours * 60 + minutes;
};

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

       
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const allAdmins = await ScannerAdmin.find({}).select(
            "email name isActive role"
        );

        console.log("ALL SCANNER ADMINS:", allAdmins);

        const admin = await ScannerAdmin.findOne({
            email: normalizedEmail,
        });
        console.log("Admin found:", !!admin);

        if (!admin) {
            console.log("❌ ADMIN NOT FOUND");

            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        
        if (!admin.isActive) {
            console.log("❌ ADMIN IS INACTIVE");

            return res.status(403).json({
                success: false,
                message: "Admin account is inactive.",
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            admin.password
        );

        console.log("Password valid:", isPasswordValid);

        if (!isPasswordValid) {
            console.log("❌ PASSWORD DOES NOT MATCH");

            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        console.log("✅ LOGIN SUCCESS");

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
    filter["bookings.date"] = date;
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
        const { adminComment, bookings } = req.body;

        console.log("=================================");
        console.log("APPROVE SCANNER BOOKING");
        console.log("Booking ID:", id);
        console.log("Received bookings:", bookings);
        console.log("=================================");

        // --------------------------------------------------
        // VALIDATE BOOKINGS ARRAY
        // --------------------------------------------------

        if (!Array.isArray(bookings) || bookings.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Booking dates and time slots are required.",
            });
        }

        if (bookings.length > 3) {
            return res.status(400).json({
                success: false,
                message: "Maximum 3 booking dates are allowed.",
            });
        }

        // --------------------------------------------------
        // FIND BOOKING
        // --------------------------------------------------

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

        // --------------------------------------------------
        // VALIDATE EVERY DATE + TIME
        // --------------------------------------------------

        for (const slot of bookings) {
            if (!slot.date || !slot.startTime || !slot.endTime) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Date, start time and end time are required for every booking.",
                });
            }

            const startMinutes = timeToMinutes(
                slot.startTime
            );

            const endMinutes = timeToMinutes(
                slot.endTime
            );

            if (
                Number.isNaN(startMinutes) ||
                Number.isNaN(endMinutes)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Invalid time slot for ${slot.date}.`,
                });
            }

            if (endMinutes <= startMinutes) {
                return res.status(400).json({
                    success: false,
                    message:
                        `End time must be later than start time for ${slot.date}.`,
                });
            }
        }

        // --------------------------------------------------
        // CHECK FOR DUPLICATE DATES
        // --------------------------------------------------

        const dates = bookings.map((slot) => slot.date);

        const uniqueDates = new Set(dates);

        if (uniqueDates.size !== dates.length) {
            return res.status(400).json({
                success: false,
                message:
                    "The same date cannot be selected more than once.",
            });
        }

        // --------------------------------------------------
        // CHECK OVERLAP BETWEEN SLOTS IN THIS BOOKING
        // --------------------------------------------------

        for (let i = 0; i < bookings.length; i++) {
            for (let j = i + 1; j < bookings.length; j++) {
                const first = bookings[i];
                const second = bookings[j];

                // Different dates cannot conflict
                if (first.date !== second.date) {
                    continue;
                }

                const firstStart = timeToMinutes(
                    first.startTime
                );

                const firstEnd = timeToMinutes(
                    first.endTime
                );

                const secondStart = timeToMinutes(
                    second.startTime
                );

                const secondEnd = timeToMinutes(
                    second.endTime
                );

                const overlap =
                    firstStart < secondEnd &&
                    firstEnd > secondStart;

                if (overlap) {
                    return res.status(409).json({
                        success: false,
                        message:
                            `The selected time slots overlap on ${first.date}.`,
                    });
                }
            }
        }

        // --------------------------------------------------
        // FIND OTHER APPROVED BOOKINGS
        // --------------------------------------------------

        const approvedBookings =
            await ScannerBooking.find({
                _id: { $ne: booking._id },
                status: "approved",
                "bookings.date": {
                    $in: dates,
                },
            });

        // --------------------------------------------------
        // CHECK CONFLICT WITH APPROVED BOOKINGS
        // --------------------------------------------------

        for (const selectedSlot of bookings) {
            const selectedStart = timeToMinutes(
                selectedSlot.startTime
            );

            const selectedEnd = timeToMinutes(
                selectedSlot.endTime
            );

            const hasConflict =
                approvedBookings.some(
                    (approvedBooking) =>
                        (approvedBooking.bookings || []).some(
                            (approvedSlot) => {
                                if (
                                    approvedSlot.date !==
                                    selectedSlot.date
                                ) {
                                    return false;
                                }

                                const approvedStart =
                                    timeToMinutes(
                                        approvedSlot.startTime
                                    );

                                const approvedEnd =
                                    timeToMinutes(
                                        approvedSlot.endTime
                                    );

                                return (
                                    selectedStart <
                                        approvedEnd &&
                                    selectedEnd >
                                        approvedStart
                                );
                            }
                        )
                );

            if (hasConflict) {
                return res.status(409).json({
                    success: false,
                    message:
                        `The selected time slot on ${selectedSlot.date} overlaps with another approved booking.`,
                });
            }
        }

        // --------------------------------------------------
        // SAVE ADMIN SELECTED DATES + TIMES
        // --------------------------------------------------

        booking.bookings = bookings;

        booking.status = "approved";

        booking.adminComment =
            adminComment || "";

        booking.reviewedBy =
            req.admin?.email ||
            req.user?.email ||
            "Scanner Admin";

        booking.reviewedAt = new Date();

        await booking.save();

        console.log(
            "FINAL APPROVED BOOKINGS:",
            booking.bookings
        );

        // --------------------------------------------------
        // SEND APPROVAL EMAIL
        // --------------------------------------------------

        try {
            const {
                sendScannerApprovalEmail,
            } = require("../Services/scannerEmailService");

            await sendScannerApprovalEmail({
                to: booking.email,
                name: booking.fullName,
                bookings: booking.bookings,
            });

            console.log(
                `Scanner approval email sent to ${booking.email}`
            );
        } catch (emailError) {
            console.error(
                "Scanner approval email error:",
                emailError
            );

            // Booking remains approved even if email fails.
        }

        // --------------------------------------------------
        // RESPONSE
        // --------------------------------------------------

        return res.status(200).json({
            success: true,
            message:
                "Scanner booking approved successfully.",
            data: booking,
        });

    } catch (error) {
        console.error(
            "Approve scanner booking error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to approve scanner booking.",
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

        // Update booking
        booking.status = "rejected";
        booking.adminComment = adminComment || "";
        booking.reviewedBy = req.admin.email;
        booking.reviewedAt = new Date();

        await booking.save();

        /*
         * --------------------------------------------------
         * SEND REJECTION EMAIL TO APPLICANT
         * --------------------------------------------------
         */

        try {
    const {
        sendScannerApprovalEmail,
    } = require("../Services/scannerEmailService");

    await sendScannerApprovalEmail({
        to: booking.email,
        name: booking.fullName,
        bookings: booking.bookings,
    });

    console.log(
        `Scanner approval email sent to ${booking.email}`
    );

} catch (emailError) {
    console.error(
        "Scanner approval email error:",
        emailError
    );

    // Booking remains approved even if email fails.
}

        return res.status(200).json({
            success: true,
            message: "Scanner booking rejected successfully.",
            data: booking,
        });

    } catch (error) {
        console.error(
            "Reject scanner booking error:",
            error
        );

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