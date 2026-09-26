const ScannerBooking = require("../models/ScannerBooking");

const {
    sendNewScannerRequestEmail,
} = require("../Services/scannerEmailService");

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

const createScannerBooking = async (req, res) => {
    try {
        const {
            fullName,
            email,
            countryCode,
            mobile,
            department,
            contactMethod,
            bookings,
            purpose,
            concerns,
            requestAnyway,
        } = req.body;

        // --------------------------------------------------
        // Basic validation
        // --------------------------------------------------

        if (
            !fullName ||
            !email ||
            !mobile ||
            !contactMethod ||
            !purpose
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields.",
            });
        }

        // --------------------------------------------------
        // Validate bookings array
        // --------------------------------------------------

        if (
            !Array.isArray(bookings) ||
            bookings.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please select at least one date and time.",
            });
        }

        if (bookings.length > 3) {
            return res.status(400).json({
                success: false,
                message:
                    "You can select a maximum of 3 dates.",
            });
        }

        // --------------------------------------------------
        // Validate every selected booking
        // --------------------------------------------------

        for (const booking of bookings) {
            if (
                !booking.date ||
                !booking.startTime ||
                !booking.endTime
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Each selected date must have a start and end time.",
                });
            }

            const startMinutes = timeToMinutes(
                booking.startTime
            );

            const endMinutes = timeToMinutes(
                booking.endTime
            );

            if (
                Number.isNaN(startMinutes) ||
                Number.isNaN(endMinutes)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid start or end time.",
                });
            }

            if (endMinutes <= startMinutes) {
                return res.status(400).json({
                    success: false,
                    message:
                        `End time must be later than start time for ${booking.date}.`,
                });
            }
        }

        // --------------------------------------------------
        // Check conflicts for every selected date
        // --------------------------------------------------

        if (!requestAnyway) {
            for (const booking of bookings) {
                const existingBookings =
                    await ScannerBooking.find({
                        "bookings.date": booking.date,
                        status: {
                            $in: ["pending", "approved"],
                        },
                    });

                const selectedStart =
                    timeToMinutes(
                        booking.startTime
                    );

                const selectedEnd =
                    timeToMinutes(
                        booking.endTime
                    );

                const hasConflict =
                    existingBookings.some(
                        (existingBooking) => {
                            return existingBooking.bookings.some(
                                (existingSlot) => {
                                    if (
                                        existingSlot.date !==
                                        booking.date
                                    ) {
                                        return false;
                                    }

                                    const existingStart =
                                        timeToMinutes(
                                            existingSlot.startTime
                                        );

                                    const existingEnd =
                                        timeToMinutes(
                                            existingSlot.endTime
                                        );

                                    return (
                                        selectedStart <
                                            existingEnd &&
                                        selectedEnd >
                                            existingStart
                                    );
                                }
                            );
                        }
                    );

                if (hasConflict) {
                    return res.status(409).json({
                        success: false,
                        message:
                            `The selected time on ${booking.date} is already reserved or waiting for approval.`,
                    });
                }
            }
        }

        // --------------------------------------------------
        // Create booking
        // --------------------------------------------------

        const bookingId = `SCN-${Date.now()}`;

        const booking =
            await ScannerBooking.create({
                bookingId,
                fullName,
                email,
                countryCode,
                mobile,
                department,
                contactMethod,
                bookings,
                purpose,
                concerns,
                status: "pending",
            });

            await sendNewScannerRequestEmail({
    bookingId,
    fullName,
    email,
    countryCode,
    mobile,
    department,
    contactMethod,
    bookings,
    purpose,
    concerns,
});

        return res.status(201).json({
            success: true,
            message:
                "Scanner booking request submitted successfully.",
            data: booking,
        });
    } catch (error) {
        console.error(
            "Create scanner booking error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to submit scanner booking request.",
        });
    }
};


const getScannerAvailability = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message:
                    "Start date and end date are required.",
            });
        }

        const bookings =
            await ScannerBooking.find({
                "bookings.date": {
                    $gte: startDate,
                    $lte: endDate,
                },
                status: {
                    $in: ["pending", "approved"],
                },
            })
                .select(
                    "bookingId fullName email mobile department contactMethod bookings purpose concerns status"
                )
                .sort({
                    createdAt: 1,
                });

        // --------------------------------------------------
        // Convert multiple bookings into availability records
        // --------------------------------------------------

        const availability = [];

        bookings.forEach((booking) => {
            booking.bookings.forEach((slot) => {
                if (
                    slot.date >= startDate &&
                    slot.date <= endDate
                ) {
                    availability.push({
                        bookingId: booking.bookingId,
                        fullName: booking.fullName,
                        email: booking.email,
                        mobile: booking.mobile,
                        department: booking.department,
                        contactMethod:
                            booking.contactMethod,
                        date: slot.date,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        purpose: booking.purpose,
                        concerns: booking.concerns,
                        status: booking.status,
                    });
                }
            });
        });

        return res.status(200).json({
            success: true,
            data: availability,
        });
    } catch (error) {
        console.error(
            "Get scanner availability error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch scanner availability.",
        });
    }
};


module.exports = {
    createScannerBooking,
    getScannerAvailability,
};