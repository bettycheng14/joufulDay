document.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("enquiryForm");
	if (!form) return;

	const nameInput = document.getElementById("name");
	const emailInput = document.getElementById("email");
	const phoneInput = document.getElementById("phone");
	const subjectInput = document.getElementById("subject");
	const messageInput = document.getElementById("message");
	const captchaInput = document.getElementById("captcha");
	const captchaImg = document.querySelector("#enquiryForm img");

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const enquiryData = {
			name: nameInput.value.trim(),
			email: emailInput.value.trim(),
			phone: phoneInput.value.trim(),
			subject: subjectInput.value.trim(),
			message: messageInput.value.trim(),
			captcha: captchaInput.value.trim(),
		};

		try {
			const response = await fetch("/enquiry", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(enquiryData),
			});

			// Parse JSON instead of text
			const data = await response.json().catch(() => null);

			if (response.ok && data?.success) {
				showAlert("✅ " + data.message, "success");
				form.reset();

				[
					nameInput,
					emailInput,
					phoneInput,
					subjectInput,
					messageInput,
					captchaInput,
				].forEach((el) => el.classList.remove("is-valid", "is-invalid"));

				// Update captcha image
				if (captchaImg && data.captcha) {
					captchaImg.src = data.captcha;
					captchaInput.value = "";
				}
			} else {
				showAlert("❌ " + (data?.message || "Failed to submit enquiry."), "danger");
			}
		} catch (err) {
			console.error("Form submit failed:", err);
			showAlert("❌ Could not submit enquiry. Please try again later.", "danger");
		}
	});

	function showAlert(message, type) {
		const existingAlert = form.querySelector(".alert");
		if (existingAlert) existingAlert.remove();

		const alertDiv = document.createElement("div");
		alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
		alertDiv.role = "alert";
		alertDiv.innerHTML = `
			${message}
			<button type="button" class="btn-close" data-bs-dismiss="alert"></button>
		`;
		form.prepend(alertDiv);
	}
});
