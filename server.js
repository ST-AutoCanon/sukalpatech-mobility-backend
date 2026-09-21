const cors = require("cors");
const express = require("express");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

dotenv.config();

const app = express();

connectDB();

// CORS
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "STS Mobility Backend is running",
    });
});

const scannerRoutes = require("./routes/ScannerBookingRoutes");
const scannerAdminRoutes = require("./routes/adminRoutes");

app.use("/api/scanner", scannerRoutes);
app.use("/api/scanner-admin", scannerAdminRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});