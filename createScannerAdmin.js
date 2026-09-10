const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const ScannerAdmin = require("./models/adminmodel");

dotenv.config();

const createAdmin = async () => {
    try {
        await connectDB();

        const email = "scanneradmin@sts-mobility.com";
        const password = "Admin@123";

        const existingAdmin = await ScannerAdmin.findOne({
            email,
        });

        if (existingAdmin) {
            console.log("Scanner admin already exists.");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await ScannerAdmin.create({
            name: "Scanner Admin",
            email,
            password: hashedPassword,
            role: "scanner_admin",
            isActive: true,
        });

        console.log("Scanner admin created successfully.");
        console.log("Email:", email);
        console.log("Password:", password);

        process.exit(0);
    } catch (error) {
        console.error("Create scanner admin error:", error);
        process.exit(1);
    }
};

createAdmin();