const form = document.getElementById("enquiryForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const messageInput = document.getElementById("message");
const captchaInput = document.getElementById("captcha");
const captchaDisplay = document.getElementById("captchaCode");
const captchaError = document.getElementById("captchaError");
let captchaCode = "";

// Generate CAPTCHA
const generateCaptcha = () => {
	captchaCode = Math.floor(10000 + Math.random() * 90000);
	captchaDisplay.textContent = captchaCode;
};

// Real-time validation helper
const validateField = (input, pattern = null, required = true) => {
	input.addEventListener("input", () => {
		input.classList.remove("is-invalid", "is-valid");
		if (required && input.value.trim() === "") {
			input.classList.add("is-invalid");
		} else if (pattern && !input.value.trim().match(pattern)) {
			input.classList.add("is-invalid");
		} else {
			input.classList.add("is-valid");
		}
	});
};

generateCaptcha();

// Apply real-time validation
validateField(nameInput);
validateField(emailInput, /^[^ ]+@[^ ]+\.[a-z]{2,3}$/);
validateField(phoneInput, /^[0-9]{8,15}$/, false);
validateField(messageInput);

// Real-time CAPTCHA check
captchaInput.addEventListener("input", () => {
	captchaInput.classList.remove("is-invalid", "is-valid");
	if (captchaInput.value.trim() === captchaCode.toString()) {
		captchaInput.classList.add("is-valid");
		captchaError.style.display = "none";
	} else {
		captchaInput.classList.add("is-invalid");
		captchaError.style.display = "block";
	}
});

// Form submission
form.addEventListener("submit", (e) => {
	e.preventDefault();

	let valid = true;

	// Name
	if (nameInput.value.trim() === "") {
		nameInput.classList.add("is-invalid");
		valid = false;
	}

	// Email
	const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
	if (
		emailInput.value.trim() === "" ||
		!emailInput.value.trim().match(emailPattern)
	) {
		emailInput.classList.add("is-invalid");
		valid = false;
	}

	// Phone
	const phonePattern = /^[0-9]{8,15}$/;
	if (
		phoneInput.value.trim() !== "" &&
		!phoneInput.value.trim().match(phonePattern)
	) {
		phoneInput.classList.add("is-invalid");
		valid = false;
	}

	// Message
	if (messageInput.value.trim() === "") {
		messageInput.classList.add("is-invalid");
		valid = false;
	}

	// CAPTCHA
	if (captchaInput.value.trim() !== captchaCode.toString()) {
		captchaInput.classList.add("is-invalid");
		captchaError.style.display = "block";
		valid = false;
	} else {
		captchaError.style.display = "none";
	}

	if (valid) {
		// Show success alert
		const alertDiv = document.createElement("div");
		alertDiv.className =
			"alert alert-success alert-dismissible fade show mt-3";
		alertDiv.role = "alert";
		alertDiv.innerHTML = `
            Thank you! Your enquiry has been submitted.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
		form.prepend(alertDiv);

		// Reset form
		form.reset();
		[nameInput, emailInput, phoneInput, messageInput, captchaInput].forEach(
			(el) => el.classList.remove("is-valid", "is-invalid")
		);

		// Regenerate CAPTCHA
		generateCaptcha();
	}
});
