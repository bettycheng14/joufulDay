const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const {
	sendEmail,
	otpTemplate,
	resetPasswordTemplate,
} = require("../utils/email");

// Handle login
router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password)
		return res.status(400).send("Email and password are required");

	const user = await User.findOne({ email });
	if (!user) return res.status(401).send("Invalid email or password");

	const match = await user.verifyPassword(password);
	if (!match) return res.status(401).send("Invalid email or password");

	if (!user.isVerified) {
		return res
			.status(403)
			.json({ message: "Please verify your email first." });
	}

	// Store user info in session (without password hash)
	req.session.user = {
		id: user._id.toString(),
		name: user.name,
		email: user.email,
		phone: user.phone || "",
	};

	res.redirect("/member-information");
});

router.post("/forgot-password", async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });
		if (!user) return res.json({ success: true });

		// Generate token
		const token = crypto.randomBytes(32).toString("hex");
		user.resetPasswordToken = token;
		user.resetPasswordExpires = Date.now() + 3600000; // 1h
		await user.save();

		// Send email
		const transporter = nodemailer.createTransport({
			service: "Gmail",
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});

		const resetLink = `http://localhost:3000/reset-password/${token}`;
		await sendEmail({
			to: email,
			subject: "Password Reset Request - JoyfulDay",
			html: resetPasswordTemplate({ resetLink }),
		});

		res.json({ success: true });
	} catch (err) {
		console.error(err);
		res.status(500).json({ success: false, error: "Server error" });
	}
});

// reset password request with one time token
router.post("/reset-password/:token", async (req, res) => {
	try {
		const user = await User.findOne({
			resetPasswordToken: req.params.token,
			resetPasswordExpires: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({
				success: false,
				message: "❌ Invalid or expired token.",
			});
		}

		const { password } = req.body;
		if (!password) {
			return res.status(400).json({
				success: false,
				message: "❌ Password is required.",
			});
		}

		const hashed = await bcrypt.hash(password, 10);
		user.password = hashed;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;
		await user.save();

		res.status(200).json({
			success: true,
			message: "✅ Password has been reset! You can now log in.",
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			success: false,
			message: "⚠️ Something went wrong. Please try again.",
		});
	}
});

// Render member information page
router.get("/member-information", async (req, res) => {
	if (!req.session.user) return res.redirect("/login");

	const { sortOption = "createdAt_desc", statusFilter = "all" } = req.query;

	try {
		let user = await User.findById(req.session.user.id)
			.populate({
				path: "bookedTours",
				populate: { path: "tour", model: "Tour" },
			})
			.populate("bookmarkedTours")
			.lean();

		// Sorting
		if (user.bookedTours && user.bookedTours.length > 0) {
			user.bookedTours.sort((a, b) => {
				if (sortOption === "createdAt_asc")
					return new Date(a.createdAt) - new Date(b.createdAt);
				if (sortOption === "createdAt_desc")
					return new Date(b.createdAt) - new Date(a.createdAt);
				if (sortOption === "tourDate_asc")
					return new Date(a.tourDate) - new Date(b.tourDate);
				if (sortOption === "tourDate_desc")
					return new Date(b.tourDate) - new Date(a.tourDate);
				return 0;
			});

			// Filtering
			if (statusFilter !== "all") {
				user.bookedTours = user.bookedTours.filter((b) => {
					const status =
						b.paymentStatus?.toLowerCase() || "confirmed";
					return statusFilter === "confirmed"
						? status === "paid" || status === "confirmed"
						: status === "pending";
				});
			}
		}

		res.render("member-information", {
			user,
			title: "Member - JoyfulDay",
			activePage: "login",
			sortOption,
			statusFilter,
		});
	} catch (err) {
		console.error(err);
		res.status(500).send("Server Error");
	}
});

// login page
router.get("/login", (req, res) => {
	res.render("login", { title: "Login - JoyfulDay", activePage: "login" });
});

// forgot password page
router.get("/forgot-password", (req, res) => {
	res.render("forgotPassword", {
		title: "Forgot Password",
		activePage: "Login",
	});
});

// reset password page with one time token
router.get("/reset-password/:token", async (req, res) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: { $gt: Date.now() },
	});
	if (!user) return res.send("Invalid or expired token.");

	res.render("resetPassword", {
		title: "Reset Password",
		token: req.params.token,
		activePage: "Login",
	});
});

// Logout
router.get("/logout", (req, res) => {
	if (req.session) {
		// Destroy the session
		req.session.destroy((err) => {
			if (err) {
				console.error("Error destroying session:", err);
				return res.status(500).send("Error logging out");
			}
			// Redirect to home page after logout
			res.redirect("/");
		});
	} else {
		res.redirect("/");
	}
});

// Handle sign up
router.post("/signup", async (req, res) => {
	try {
		const { name, email, password } = req.body;
		if (!name || !email || !password)
			return res.status(400).send("All fields are required");

		const existing = await User.findOne({ email });
		if (existing) return res.status(409).send("Email already registered");

		const newUser = new User({ name, email });
		await newUser.setPassword(password);

		// Generate OTP
		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		newUser.otp = otp;
		newUser.otpExpires = Date.now() + 15 * 60 * 1000; // 15 minutes expiry

		await newUser.save();

		// Send OTP email
		await sendEmail({
			to: email,
			subject: "Verify your email - JoyfulDay",
			html: otpTemplate({ otp }),
		});

		res.redirect(`/verify?email=${email}`);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

// verify signup with OTP page
router.get("/verify", (req, res) => {
	const { email, error, success } = req.query;
	res.render("verify-otp", {
		title: "Verify Email - JoyfulDay",
		email,
		error,
		success,
		activePage: "",
	});
});

// handle submission of verify of OTP
router.post("/verify-otp", async (req, res) => {
	try {
		const { email, otp } = req.body;

		// Find user
		const user = await User.findOne({ email });
		if (!user)
			return res.redirect(`/verify?email=${email}&error=User not found`);

		if (user.otp !== otp || Date.now() > user.otpExpires) {
			return res.redirect(
				`/verify?email=${email}&error=Invalid or expired OTP`
			);
		}

		// Mark verified
		user.isVerified = true;
		user.otp = undefined;
		user.otpExpires = undefined;
		await user.save();

		// Auto-login after signup
		req.session.user = {
			id: user._id.toString(),
			name: user.name,
			email: user.email,
			phone: user.phone || "",
		};

		res.redirect("/member-information");
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

// Get current user info (for populating member-info form)
router.get("/api/member", (req, res) => {
	if (!req.session.user)
		return res.status(401).json({ error: "Not logged in" });
	res.json(req.session.user);
});

// Update member info
router.post("/api/member", async (req, res) => {
	if (!req.session.user)
		return res.status(401).json({ error: "Not logged in" });

	const { name, phone, password } = req.body;
	const user = await User.findById(req.session.user.id);
	if (!user) return res.status(404).json({ error: "User not found" });

	if (name) user.name = name;
	if (phone) user.phone = phone;
	if (password) await user.setPassword(password);

	await user.save();

	// Update session
	req.session.user.name = user.name;
	req.session.user.phone = user.phone;

	res.json({ success: true, user: req.session.user });
});

// Delete user bookmark
router.delete("/user/bookmark/:tourId", async (req, res) => {
	try {
		if (!req.session.user) {
			return res.status(401).json({ error: "Not logged in" });
		}

		const { tourId } = req.params;
		await User.findByIdAndUpdate(req.session.user.id, {
			$pull: { bookmarkedTours: tourId },
		});

		res.json({ success: true, message: "Bookmark removed" });
	} catch (err) {
		console.error("Error removing bookmark:", err);
		res.status(500).json({ error: "Server error" });
	}
});

module.exports = router;
