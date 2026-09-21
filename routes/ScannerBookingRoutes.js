const express = require("express");

const router = express.Router();

const {
    createScannerBooking,
    getScannerAvailability,
} = require("../controllers/ScannerBookingController");

router.post("/bookings", createScannerBooking);

router.get("/availability", getScannerAvailability);

module.exports = router;        