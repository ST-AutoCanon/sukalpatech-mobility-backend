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
// EXPORTS
// --------------------------------------------------

module.exports = {
    sendScannerApprovalEmail,
    sendScannerRejectionEmail,
};