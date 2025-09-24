const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

async function sendOrderConfirmation(to, booking) {
	const mailOptions = {
		from: `"JoyfulDay Tours" <${process.env.EMAIL_USER}>`,
		to,
		subject: "Your JoyfulDay Booking Confirmation 🎉",
		html: `
            <h2>✅ Booking Confirmed!</h2>
            <p>Hi ${booking.userName || "Traveler"},</p>
            <p>Thank you for booking with <strong>JoyfulDay</strong>. Here are your booking details:</p>
            <ul>
                <li><b>Tour:</b> ${booking.tourName}</li>
                <li><b>Date:</b> ${new Date(booking.tourDate)
					.toISOString()
					.split("T")[0]
					.replace(/-/g, "/")}</li>
                <li><b>Packages:</b> ${booking.quantity}</li>
                <li><b>Status:</b> ${booking.paymentStatus}</li>
            </ul>
            <p>We look forward to seeing you soon!</p>
            <p>🌏 JoyfulDay Team</p>
        `,
	};

	return transporter.sendMail(mailOptions);
}

module.exports = { sendOrderConfirmation };
