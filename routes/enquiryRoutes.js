const express = require("express");
const router = express.Router();
const Enquiry = require("../models/Enquiry");
const captchaCode = [
	{ src: "images/captcha1.png", code: "25m6p" },
	{ src: "images/captcha2.png", code: "325fb" },
	{ src: "images/captcha3.png", code: "44c22" },
	{ src: "images/captcha4.png", code: "5dxnm" },
	{ src: "images/captcha5.png", code: "6wnyc" },
];

// GET: display enquiry form
router.get("/enquiry", (req, res) => {
	const randomCode =
		captchaCode[Math.floor(Math.random() * captchaCode.length)];
	// save the captcha code in session
	req.session.expectedCode = randomCode.code;
	req.session.expectedImage = randomCode.src;
	console.log({ session: req.session });

	res.render("enquiry", {
		title: "Enquiry - JoyfulDay",
		activePage: "enquiry",
		formData: {},
		errors: {},
		success: null,
		captcha: randomCode.src,
	});
});

// POST: submit enquiry
router.post("/enquiry", async (req, res) => {
	try {
		const { name, email, phone, subject, message, captcha } = req.body;

		// Basic validation
		if (!name || !email || !message) {
			return res
				.status(400)
				.send({ message: "Name, email, and message are required." });
		}
		// captcha check
		console.log({ captcha,e:req.session.expectedCode });

		if (!captcha || captcha.trim() !== req.session.expectedCode) {
			return res.status(400).send({ message: "Wrong Captcha Code." });
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

		// update captcha
		const randomCode =
			captchaCode[Math.floor(Math.random() * captchaCode.length)];
		// save the captcha code in session
		req.session.expectedCode = randomCode.code;
		req.session.expectedImage = randomCode.src;

		console.log({ captchaCode: { ...req.session }, randomCode });
		// Send success with new captcha image
		res.status(200).json({
			success: true,
			message: "Enquiry submitted successfully!",
			captcha: randomCode.src,
		});
	} catch (err) {
		console.error("Error saving enquiry:", err);
		res.status(500).send("Error saving enquiry");
	}
});

module.exports = router;
