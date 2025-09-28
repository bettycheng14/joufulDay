const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

// general functions to send email
async function sendEmail({ to, subject, html }) {
	const mailOptions = {
		from: `"JoyfulDay Tours" <${process.env.EMAIL_USER}>`,
		to,
		subject,
		html,
	};
	await transporter.sendMail(mailOptions);
}

// Order confirmation template
function bookingTemplate({
	userName,
	tourName,
	tourDate,
	quantity,
	paymentStatus,
}) {
	return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #2c3e50;">✅ Booking Confirmed!</h2>
    <p>Hi ${userName || "Traveler"},</p>
    <p>Thank you for booking with <strong>JoyfulDay</strong>. Here are your booking details:</p>
    <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <ul style="list-style: none; padding: 0; margin: 0; font-size: 16px;">
        <li><strong>Tour:</strong> ${tourName}</li>  
        <li><strong>Date:</strong> ${new Date(tourDate)
			.toISOString()
			.split("T")[0]
			.replace(/-/g, "/")}</li>
        <li><strong>Packages:</strong> ${quantity}</li>
        <li><strong>Status:</strong> ${paymentStatus}</li>
      </ul>
    </div>
    <p>We look forward to seeing you soon!</p>
    <hr>
    <p style="font-size: 12px; color: #777;">🌏 JoyfulDay Team</p>
  </div>
  `;
}

// OTP verification template
function otpTemplate({ otp }) {
	return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #2c3e50;">🎉 Welcome to JoyfulDay</h2>
    <p>Thank you for signing up! To complete your registration, please use the OTP below:</p>
    <div style="background:#f4f4f4; padding: 15px; text-align: center; font-size: 20px; font-weight: bold; letter-spacing: 2px; border-radius: 6px; margin: 20px 0;">
      ${otp}
    </div>
    <p>This code will <strong>expire in 15 minutes</strong>.</p>
    <p>If you didn’t request this, you can safely ignore this email.</p>
    <hr>
    <p style="font-size: 12px; color: #777;">🌏 JoyfulDay Team</p>
  </div>
  `;
}

// Password reset template
function resetPasswordTemplate({ resetLink }) {
	return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #2c3e50;">🔑 Password Reset Request</h2>
    <p>We received a request to reset your password for your JoyfulDay account.</p>
    <p>Click the button below to reset your password:</p>
    <div style="text-align:center; margin: 20px 0;">
      <a href="${resetLink}" 
      style="
        background-color: #28a745;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        display: inline-block;
      ">
      Reset Password
      </a>
    </div>
    <p>This link will <strong>expire in 1 hour</strong>. If you didn’t request a password reset, you can safely ignore this email.</p>
    <hr>
    <p style="font-size: 12px; color: #777;">🌏 JoyfulDay Team</p>
  </div>
  `;
}

module.exports = {
	sendEmail,
	bookingTemplate,
	otpTemplate,
	resetPasswordTemplate,
};
