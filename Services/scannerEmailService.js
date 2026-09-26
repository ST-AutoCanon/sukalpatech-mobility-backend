require("dotenv").config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

// --------------------------------------------------
// APPROVAL EMAIL
// --------------------------------------------------

const sendScannerApprovalEmail = async ({
    to,
    name,
    bookings,
    adminComment
}) => {
    
    const safeBookings = Array.isArray(bookings) ? bookings : [];

    const bookingRows = safeBookings
        .map(
            (slot) => `
                <tr>
                    <td style="
                        padding: 10px;
                        border: 1px solid #ddd;
                        font-size: 14px;
                    ">
                        ${slot.date}
                    </td>

                    <td style="
                        padding: 10px;
                        border: 1px solid #ddd;
                        font-size: 14px;
                    ">
                        ${slot.startTime}
                    </td>

                    <td style="
                        padding: 10px;
                        border: 1px solid #ddd;
                        font-size: 14px;
                    ">
                        ${slot.endTime}
                    </td>
                </tr>
            `
        )
        .join("");

    const bookingText = safeBookings
        .map(
            (slot, index) =>
                `${index + 1}. Date: ${slot.date}
   Time: ${slot.startTime} - ${slot.endTime}`
        )
        .join("\n\n");

    const mailOptions = {
        from: `"Sukalpa Mobility Services" <${process.env.SMTP_USER}>`,
        to,
        subject: "Scanner Booking Approved",

        text: `
Hello ${name},

Your scanner booking request has been approved.

Confirmed booking details:

${bookingText}

${adminComment
                ? `Admin Comment:
${adminComment}

`
                : ""
            }
Your scanner booking is approved for the above time slot(s).

Thank you,
Sukalpa Mobility Services
`.trim(),

        html: `
            <div
                style="
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                "
            >
                <h2 style="color: #0A2D63;">
                    Scanner Booking Approved
                </h2>

                <p>
                    Hello ${name},
                </p>

                <p>
                    Your scanner booking request has been
                    <strong style="color: #16a34a;">
                        approved
                    </strong>.
                </p>

                <h3 style="color: #0A2D63;">
                    Confirmed Booking Details
                </h3>

                <table
                    style="
                        width: 100%;
                        max-width: 700px;
                        border-collapse: collapse;
                        margin-top: 10px;
                    "
                >
                    <thead>
                        <tr>
                            <th
                                style="
                                    padding: 10px;
                                    border: 1px solid #ddd;
                                    background: #f3f4f6;
                                    text-align: left;
                                "
                            >
                                Date
                            </th>

                            <th
                                style="
                                    padding: 10px;
                                    border: 1px solid #ddd;
                                    background: #f3f4f6;
                                    text-align: left;
                                "
                            >
                                Start Time
                            </th>

                            <th
                                style="
                                    padding: 10px;
                                    border: 1px solid #ddd;
                                    background: #f3f4f6;
                                    text-align: left;
                                "
                            >
                                End Time
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        ${bookingRows}
                    </tbody>
                </table>

                ${adminComment
                ? `
            <div
                style="
                    margin-top: 20px;
                    padding: 12px 15px;
                    background: #f9fafb;
                    border-left: 4px solid #0A2D63;
                "
            >
                <strong>
                    Admin Comment:
                </strong>

                <p style="margin: 6px 0 0;">
                    ${adminComment}
                </p>
            </div>
        `
                : ""
            }

<p style="margin-top: 20px;">
    Your scanner booking is approved for the above
    time slot(s).
</p>

                <p>
                    Thank you,<br />
                    <strong>
                        Sukalpa Mobility Services
                    </strong>
                </p>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions);
};

// --------------------------------------------------
// REJECTION EMAIL
// --------------------------------------------------

const sendScannerRejectionEmail = async ({
    to,
    name,
    bookings,
    adminComment,
}) => {
    const safeBookings = Array.isArray(bookings) ? bookings : [];

    const bookingRows = safeBookings
        .map(
            (slot) => `
                <tr>
                    <td style="
                        padding: 10px;
                        border: 1px solid #ddd;
                        font-size: 14px;
                    ">
                        ${slot.date}
                    </td>

                    <td style="
                        padding: 10px;
                        border: 1px solid #ddd;
                        font-size: 14px;
                    ">
                        ${slot.startTime}
                    </td>

                    <td style="
                        padding: 10px;
                        border: 1px solid #ddd;
                        font-size: 14px;
                    ">
                        ${slot.endTime}
                    </td>
                </tr>
            `
        )
        .join("");

    const bookingText = safeBookings
        .map(
            (slot, index) =>
                `${index + 1}. Date: ${slot.date}
   Time: ${slot.startTime} - ${slot.endTime}`
        )
        .join("\n\n");

    const mailOptions = {
        from: `"Sukalpa Mobility Services" <${process.env.SMTP_USER}>`,
        to,
        subject: "Scanner Booking Request Rejected",

        text: `
Dear ${name},

Your scanner booking request has been rejected.

Booking Details:

${bookingText}

${adminComment
                ? `Admin Comment:
${adminComment}

`
                : ""
            }
If you have any questions, please contact our team.

Regards,
Sukalpa Mobility Services
        `.trim(),

        html: `
            <div
                style="
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                "
            >
                <h2 style="color: #0A2D63;">
                    Scanner Booking Request Rejected
                </h2>

                <p>
                    Dear ${name},
                </p>

                <p>
                    Your scanner booking request has been
                    <strong style="color: #dc2626;">
                        rejected
                    </strong>.
                </p>

                <h3 style="color: #0A2D63;">
                    Booking Details
                </h3>

                <table
                    style="
                        width: 100%;
                        max-width: 700px;
                        border-collapse: collapse;
                        margin-top: 10px;
                    "
                >
                    <thead>
                        <tr>
                            <th
                                style="
                                    padding: 10px;
                                    border: 1px solid #ddd;
                                    background: #f3f4f6;
                                    text-align: left;
                                "
                            >
                                Date
                            </th>

                            <th
                                style="
                                    padding: 10px;
                                    border: 1px solid #ddd;
                                    background: #f3f4f6;
                                    text-align: left;
                                "
                            >
                                Start Time
                            </th>

                            <th
                                style="
                                    padding: 10px;
                                    border: 1px solid #ddd;
                                    background: #f3f4f6;
                                    text-align: left;
                                "
                            >
                                End Time
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        ${bookingRows}
                    </tbody>
                </table>

                ${adminComment
                ? `
                            <div
                                style="
                                    margin-top: 20px;
                                    padding: 12px 15px;
                                    background: #f9fafb;
                                    border-left: 4px solid #0A2D63;
                                "
                            >
                                <strong>
                                    Admin Comment:
                                </strong>

                                <p style="margin: 6px 0 0;">
                                    ${adminComment}
                                </p>
                            </div>
                        `
                : ""
            }

                <p style="margin-top: 20px;">
                    If you have any questions, please contact our team.
                </p>

                <p>
                    Regards,<br />
                    <strong>
                        Sukalpa Mobility Services
                    </strong>
                </p>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions);
};

// --------------------------------------------------
// NEW SCANNER REQUEST EMAIL - ADMIN
// --------------------------------------------------

const sendNewScannerRequestEmail = async ({
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
}) => {
    const safeBookings = Array.isArray(bookings) ? bookings : [];

    const bookingRows = safeBookings
        .map(
            (slot) => `
                <tr>
                    <td style="
                        padding: 10px;
                        border: 1px solid #ddd;
                        font-size: 14px;
                    ">
                        ${slot.date}
                    </td>

                    <td style="
                        padding: 10px;
                        border: 1px solid #ddd;
                        font-size: 14px;
                    ">
                        ${slot.startTime}
                    </td>

                    <td style="
                        padding: 10px;
                        border: 1px solid #ddd;
                        font-size: 14px;
                    ">
                        ${slot.endTime}
                    </td>
                </tr>
            `
        )
        .join("");

    const bookingText = safeBookings
        .map(
            (slot, index) =>
                `${index + 1}. Date: ${slot.date}
   Time: ${slot.startTime} - ${slot.endTime}`
        )
        .join("\n\n");

    const mailOptions = {
        from: `"Sukalpa Mobility Services" <${process.env.SMTP_USER}>`,

        // Admin inbox
        to: process.env.SMTP_USER,

        subject: `New Scanner Request - ${bookingId}`,

        text: `
New Scanner Booking Request

Booking ID: ${bookingId}

Customer Details:
Name: ${fullName}
Email: ${email}
Mobile: ${countryCode || ""} ${mobile}
Department: ${department || "N/A"}
Contact Method: ${contactMethod}

Requested Scanner Slots:

${bookingText}

Purpose:
${purpose}

Concerns:
${concerns || "N/A"}

Status: Pending Approval

Please login to the admin panel to review and approve or reject this request.

Regards,
Sukalpa Mobility Services
        `.trim(),

        html: `
            <div
                style="
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                "
            >
                <h2 style="color: #0A2D63;">
                    New Scanner Booking Request
                </h2>

                <p>
                    A new scanner booking request has been submitted
                    and is waiting for your approval.
                </p>

                <p>
                    <strong>Booking ID:</strong> ${bookingId}
                </p>

                <h3 style="color: #0A2D63;">
                    Customer Details
                </h3>

                <p>
                    <strong>Name:</strong> ${fullName}<br />
                    <strong>Email:</strong> ${email}<br />
                    <strong>Mobile:</strong> ${countryCode || ""} ${mobile}<br />
                    <strong>Department:</strong> ${department || "N/A"}<br />
                    <strong>Contact Method:</strong> ${contactMethod}
                </p>

                <h3 style="color: #0A2D63;">
                    Requested Scanner Slots
                </h3>

                <table
                    style="
                        width: 100%;
                        max-width: 700px;
                        border-collapse: collapse;
                        margin-top: 10px;
                    "
                >
                    <thead>
                        <tr>
                            <th
                                style="
                                    padding: 10px;
                                    border: 1px solid #ddd;
                                    background: #f3f4f6;
                                    text-align: left;
                                "
                            >
                                Date
                            </th>

                            <th
                                style="
                                    padding: 10px;
                                    border: 1px solid #ddd;
                                    background: #f3f4f6;
                                    text-align: left;
                                "
                            >
                                Start Time
                            </th>

                            <th
                                style="
                                    padding: 10px;
                                    border: 1px solid #ddd;
                                    background: #f3f4f6;
                                    text-align: left;
                                "
                            >
                                End Time
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        ${bookingRows}
                    </tbody>
                </table>

                <h3 style="color: #0A2D63;">
                    Request Details
                </h3>

                <p>
                    <strong>Purpose:</strong><br />
                    ${purpose}
                </p>

                <p>
                    <strong>Concerns:</strong><br />
                    ${concerns || "N/A"}
                </p>

                <p
                    style="
                        margin-top: 20px;
                        padding: 12px 15px;
                        background: #fff7ed;
                        border-left: 4px solid #f59e0b;
                    "
                >
                    <strong>Status:</strong> Pending Approval
                </p>

                <p>
                    Please login to the admin panel to review this
                    scanner booking request.
                </p>

                <p>
                    Regards,<br />
                    <strong>
                        Sukalpa Mobility Services
                    </strong>
                </p>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions);
};

// --------------------------------------------------
// EXPORTS
// --------------------------------------------------

module.exports = {
    sendScannerApprovalEmail,
    sendScannerRejectionEmail,
    sendNewScannerRequestEmail,
};