const express = require("express");

const router = express.Router();

const {
    createScannerBooking,
    getScannerAvailability,
} = require("../controllers/ScannerBookingController");

const {
    getBlockedSlots,
} = require("../controllers/admincontroller");

router.post("/bookings", createScannerBooking);

router.get("/availability", getScannerAvailability);
router.get("/blocked-slots", getBlockedSlots);


module.exports = router;        