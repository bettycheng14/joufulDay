const form = document.getElementById("memberInfoForm");
const nameInput = document.getElementById("memberName");
const emailInput = document.getElementById("memberEmail");
const phoneInput = document.getElementById("memberPhone");
const passwordInput = document.getElementById("memberPassword");
const confirmPasswordInput = document.getElementById("memberConfirmPassword");

async function loadMemberInfo() {
	try {
		const res = await fetch("/api/member");
		if (res.status !== 200) return (window.location.href = "/login");

		const user = await res.json();
		nameInput.value = user.name || "";
		emailInput.value = user.email || "";
		phoneInput.value = user.phone || "";
	} catch (err) {
		console.error("Error fetching member info:", err);
		window.location.href = "/login";
	}
}

window.addEventListener("DOMContentLoaded", () => {
	loadMemberInfo();

	const hash = window.location.hash;
	if (hash === "#bookmarksSection") {
		showBookmarks();
	} else {
		showInfo();
	}
});

// Form submission
form.addEventListener("submit", async (e) => {
	e.preventDefault();

	const name = nameInput.value.trim();
	const phone = phoneInput.value.trim();
	const password = passwordInput.value.trim();
	const confirm = confirmPasswordInput.value.trim();

	if (!name) return alert("Name is required.");
	if (password && password !== confirm)
		return alert("Passwords do not match.");

	try {
		const res = await fetch("/api/member", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name, phone, password }),
		});

		const data = await res.json();
		if (data.success) {
			showFieldAlert(
				form,
				"✅ Member information updated successfully!",
				"success"
			);

			loadMemberInfo();
			form.reset();
			[
				nameInput,
				phoneInput,
				passwordInput,
				confirmPasswordInput,
			].forEach((el) => el.classList.remove("is-valid", "is-invalid"));
		} else {
			showFieldAlert(
				form,
				"Update failed: " + (data.error || "Unknown error"),
				"danger"
			);
		}
	} catch (err) {
		showFieldAlert(form, "Error connecting to server.", "danger");
		console.error(err);
	}
});

document.getElementById("info-tab").addEventListener("click", showInfo);
document.getElementById("bookings-tab").addEventListener("click", showBookings);
document
	.getElementById("bookmarks-tab")
	.addEventListener("click", showBookmarks);

function showInfo() {
	document.getElementById("memberInfoSection").classList.remove("d-none");
	document.getElementById("bookmarksSection").classList.add("d-none");
	document.getElementById("bookingsSection").classList.add("d-none");

	document.getElementById("info-tab").classList.add("active");
	document.getElementById("bookmarks-tab").classList.remove("active");
	document.getElementById("bookings-tab").classList.remove("active");
}
function showBookmarks() {
	document.getElementById("memberInfoSection").classList.add("d-none");
	document.getElementById("bookmarksSection").classList.remove("d-none");
	document.getElementById("bookingsSection").classList.add("d-none");

	document.getElementById("bookmarks-tab").classList.add("active");
	document.getElementById("info-tab").classList.remove("active");
	document.getElementById("bookings-tab").classList.remove("active");
}
function showBookings() {
	document.getElementById("memberInfoSection").classList.add("d-none");
	document.getElementById("bookmarksSection").classList.add("d-none");
	document.getElementById("bookingsSection").classList.remove("d-none");

	document.getElementById("bookings-tab").classList.add("active");
	document.getElementById("info-tab").classList.remove("active");
	document.getElementById("bookmarks-tab").classList.remove("active");
}

function showFieldAlert(form, message, type = "danger") {
	const existing = form.querySelector(".alert");
	if (existing) existing.remove();
	const alertDiv = document.createElement("div");
	alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
	alertDiv.role = "alert";
	alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
	form.prepend(alertDiv);
}
