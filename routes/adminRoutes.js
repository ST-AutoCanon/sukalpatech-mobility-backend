const express = require("express");

const router = express.Router();

const {
    adminLogin,
    getScannerBookings,
    getScannerBookingById,
    approveScannerBooking,
    rejectScannerBooking,
} = require("../controllers/admincontroller");

const adminAuth = require("../middleware/adminauth");

// Admin login
router.post("/login", adminLogin);

// Protected admin booking APIs
router.get(
    "/bookings",
    adminAuth,
    getScannerBookings
);

router.get(
    "/bookings/:id",
    adminAuth,
    getScannerBookingById
);

router.put(
    "/bookings/:id/approve",
    adminAuth,
    approveScannerBooking
);

router.put(
    "/bookings/:id/reject",
    adminAuth,
    rejectScannerBooking
);

module.exports = router;