document.addEventListener("DOMContentLoaded", () => {
	flatpickr("#tourDate", {
		dateFormat: "Y/m/d",
		minDate: "today",
		defaultDate: "today",
		weekNumbers: true,
		disableMobile: true,
	});

	const bookingForm = document.getElementById("bookingForm");
	if (!bookingForm) return;

	const tourId = bookingForm.dataset.tourId;
	const dateInput = document.getElementById("tourDate");

	// Helper to show alerts inside the form
	function showAlert(message, type = "danger") {
		const existingAlert = bookingForm.querySelector(".alert");
		if (existingAlert) existingAlert.remove();

		const alertDiv = document.createElement("div");
		alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
		alertDiv.role = "alert";
		alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
		bookingForm.prepend(alertDiv);
	}

	bookingForm.addEventListener("submit", async (e) => {
		e.preventDefault();

		const date = dateInput.value;
		if (!date) return showAlert("Please select a date.", "warning");

		const quantity =
			parseInt(document.getElementById("quantity").value, 10) || 1;

		try {
			const response = await fetch(`/tour/${tourId}/book`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ date, quantity }),
			});

			const data = await response.json();

			if (response.ok && data.url) {
				// Optional: show a success alert before redirecting
				showAlert("Redirecting to payment...", "success");
				setTimeout(() => {
					window.location.href = data.url;
				}, 800); // slight delay to show the alert
			} else {
				showAlert(
					"❌ " + (data.message || "Unable to start payment."),
					"danger"
				);
			}
		} catch (err) {
			console.error("Booking failed:", err);
			showAlert(
				"❌ Could not process booking. Please try again.",
				"danger"
			);
		}
	});
});
