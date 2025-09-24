const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },
	tourDate: { type: Date, required: true },
	paymentStatus: {
		type: String,
		enum: ["Pending", "Paid", "Failed"],
		default: "Pending",
	},
	stripeSessionId: { type: String },
	createdAt: { type: Date, default: Date.now },
	quantity: { type: Number, required: true },
});

module.exports = mongoose.model("Booking", bookingSchema);
