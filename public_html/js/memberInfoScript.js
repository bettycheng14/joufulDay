const form = document.getElementById("memberInfoForm");
const nameInput = document.getElementById("memberName");
const emailInput = document.getElementById("memberEmail");
const phoneInput = document.getElementById("memberPhone");
const passwordInput = document.getElementById("memberPassword");
const confirmPasswordInput = document.getElementById("memberConfirmPassword");

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

// Apply real-time validation
validateField(nameInput);
validateField(emailInput, /^[^ ]+@[^ ]+\.[a-z]{2,}$/);
validateField(phoneInput, /^[0-9]{8,15}$/, false);
validateField(passwordInput, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/); // At least 6 chars

// Confirm password validation
confirmPasswordInput.addEventListener("input", () => {
	confirmPasswordInput.classList.remove("is-invalid", "is-valid");
	if (confirmPasswordInput.value.trim() === "") {
		confirmPasswordInput.classList.add("is-invalid");
	} else if (confirmPasswordInput.value !== passwordInput.value) {
		confirmPasswordInput.classList.add("is-invalid");
	} else {
		confirmPasswordInput.classList.add("is-valid");
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
	const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,}$/;
	if (
		emailInput.value.trim() === "" ||
		!emailInput.value.trim().match(emailPattern)
	) {
		emailInput.classList.add("is-invalid");
		valid = false;
	}

	// Phone (optional)
	const phonePattern = /^[0-9]{8,15}$/;
	if (
		phoneInput.value.trim() !== "" &&
		!phoneInput.value.trim().match(phonePattern)
	) {
		phoneInput.classList.add("is-invalid");
		valid = false;
	}

	// Password
	if (passwordInput.value.trim().length < 6) {
		passwordInput.classList.add("is-invalid");
		valid = false;
	}

	// Confirm Password
	if (
		confirmPasswordInput.value.trim() === "" ||
		confirmPasswordInput.value !== passwordInput.value
	) {
		confirmPasswordInput.classList.add("is-invalid");
		valid = false;
	}

	if (valid) {
		// Success alert
		const alertDiv = document.createElement("div");
		alertDiv.className =
			"alert alert-success alert-dismissible fade show mt-3";
		alertDiv.role = "alert";
		alertDiv.innerHTML = `
            ✅ Member information updated successfully!
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
		form.prepend(alertDiv);

		// Reset form
		form.reset();
		[
			nameInput,
			emailInput,
			phoneInput,
			passwordInput,
			confirmPasswordInput,
		].forEach((el) => el.classList.remove("is-valid", "is-invalid"));
	}
});

// Toggle between sections
document.getElementById("info-tab").addEventListener("click", () => {
	document.getElementById("memberInfoSection").classList.remove("d-none");
	document.getElementById("bookingsSection").classList.add("d-none");
	document.getElementById("info-tab").classList.add("active");
	document.getElementById("bookings-tab").classList.remove("active");
});

document.getElementById("bookings-tab").addEventListener("click", () => {
	document.getElementById("memberInfoSection").classList.add("d-none");
	document.getElementById("bookingsSection").classList.remove("d-none");
	document.getElementById("bookings-tab").classList.add("active");
	document.getElementById("info-tab").classList.remove("active");
});
