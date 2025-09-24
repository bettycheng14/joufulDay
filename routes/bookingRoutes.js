const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Tour = require("../models/Tour");
const User = require("../models/User");
const Booking = require("../models/Booking");
const { sendOrderConfirmation } = require("../utils/email");

// POST: Create Stripe session & initiate booking
router.post("/tour/:id/book", async (req, res) => {
	try {
		const userId = req.session.user?.id;
		console.log({ userId, session: { ...req.session } });
		if (!userId)
			return res.status(401).json({ message: "Please login first." });

		const tourId = req.params.id;
		const { date, quantity } = req.body;
		if (!date)
			return res.status(400).json({ message: "Please select a date." });

		const tour = await Tour.findById(tourId);
		if (!tour) return res.status(404).json({ message: "Tour not found." });
		const qty = Math.max(parseInt(quantity, 10), 1);

		// Create a pending booking in DB
		const booking = await Booking.create({
			user: userId,
			tour: tourId,
			tourDate: date,
			quantity,
			paymentStatus: "Pending",
		});

		// Save reference in user document
		await User.findByIdAndUpdate(userId, {
			$push: { bookedTours: booking._id },
		});

		// Create Stripe checkout session
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: [
				{
					price_data: {
						currency: "aud",
						product_data: {
							name: tour.title,
						},
						unit_amount: Math.round(tour.price * 100),
					},
					quantity: qty,
				},
			],
			mode: "payment",
			metadata: {
				bookingId: booking._id.toString(), // <-- add bookingId here
				userId,
				tourId,
				tourDate: date,
				quantity: qty,
			},
			success_url: `http://localhost:3000/booking-confirmation/${booking._id}`,
			cancel_url: `http://localhost:3000/tour/${tourId}?canceled=true`,
		});

		// Save Stripe session ID in booking
		booking.stripeSessionId = session.id;
		await booking.save();

		res.json({ url: session.url });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server Error" });
	}
});

router.get("/booking-confirmation/:bookingId", async (req, res) => {
	const { bookingId } = req.params;
	try {
		const booking = await Booking.findById(bookingId)
			.populate("tour")
			.populate("user");
		if (!booking) return res.redirect("/");

		if (booking.paymentStatus !== "Paid") {
			booking.paymentStatus = "Paid";
			await booking.save();
		}

		// Send confirmation email (async, no need to block response)
		sendOrderConfirmation(booking.user.email, {
			userName: booking.user.name,
			tourName: booking.tour.title,
			tourDate: booking.tourDate,
			quantity: booking.quantity,
			paymentStatus: booking.paymentStatus || "Confirmed",
		}).catch(console.error);

		const date = new Date(booking.tourDate)
			.toISOString()
			.split("T")[0]
			.replace(/-/g, "/");

		res.render("booking-confirmation", {
			orderId: booking._id,
			tourName: booking.tour.title,
			date,
			quantity: booking.quantity,
			activePage: "",
			title: "Booking Confirmed",
		});
	} catch (err) {
		console.error(err);
		res.redirect("/");
	}
});

module.exports = router;
