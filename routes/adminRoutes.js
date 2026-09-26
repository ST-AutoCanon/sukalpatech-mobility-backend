const express = require("express");

const router = express.Router();

const {
    adminLogin,
    getScannerBookings,
    getScannerBookingById,
    approveScannerBooking,
    rejectScannerBooking,

    getBlockedSlots,
    createBlockedSlot,
    deleteBlockedSlot,
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

// ============================================================
// BLOCKED SCANNER SLOT APIs
// ============================================================

router.get(
    "/blocked-slots",
    adminAuth,
    getBlockedSlots
);

router.post(
    "/blocked-slots",
    adminAuth,
    createBlockedSlot
);

router.delete(
    "/blocked-slots/:id",
    adminAuth,
    deleteBlockedSlot
);

module.exports = router;