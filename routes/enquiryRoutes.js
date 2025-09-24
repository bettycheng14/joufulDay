const express = require("express");
const router = express.Router();
const Enquiry = require("../models/Enquiry");

// GET: display enquiry form
router.get("/enquiry", (req, res) => {
	res.render("enquiry", {
		title: "Enquiry - JoyfulDay",
		activePage: "enquiry",
		formData: {},
		errors: {},
		success: null,
	});
});

// POST: submit enquiry
router.post("/enquiry", async (req, res) => {
	try {
		const { name, email, phone, subject, message } = req.body;

		// Basic validation
		if (!name || !email || !message) {
			return res
				.status(400)
				.send("Name, email, and message are required.");
		}

		const e = new Enquiry({
			name: name.trim(),
			email: email.trim(),
			phone: phone?.trim(),
			subject: subject?.trim(),
			message: message.trim(),
			submittedAt: new Date(),
		});

		await e.save();

		res.status(200).send("success");
	} catch (err) {
		console.error("Error saving enquiry:", err);
		res.status(500).send("Error saving enquiry");
	}
});

module.exports = router;
