const form = document.getElementById("memberInfoForm");
const nameInput = document.getElementById("memberName");
const emailInput = document.getElementById("memberEmail");
const phoneInput = document.getElementById("memberPhone");
const passwordInput = document.getElementById("memberPassword");
const confirmPasswordInput = document.getElementById("memberConfirmPassword");

// Sections & Tabs
const sections = {
	info: document.getElementById("memberInfoSection"),
	bookmarks: document.getElementById("bookmarksSection"),
	bookings: document.getElementById("bookingsSection"),
};
const tabs = {
	info: document.getElementById("info-tab"),
	bookmarks: document.getElementById("bookmarks-tab"),
	bookings: document.getElementById("bookings-tab"),
};

// Load member info
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

// Show a section
function showSection(key) {
	Object.keys(sections).forEach((s) => {
		sections[s].classList.toggle("d-none", s !== key);
		tabs[s].classList.toggle("active", s === key);
	});
	history.replaceState(null, null, `#${key}Section`);
}

// Handle hash navigation
function handleHash() {
	if (location.hash === "#bookmarksSection") return showSection("bookmarks");
	if (location.hash === "#bookingsSection") return showSection("bookings");
	showSection("info");
}

// Show alert on top of the form
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

// Form submission
form.addEventListener("submit", async (e) => {
	e.preventDefault();

	const name = nameInput.value.trim();
	const phone = phoneInput.value.trim();
	const password = passwordInput.value.trim();
	const confirm = confirmPasswordInput.value.trim();

	if (!name) return showFieldAlert(form, "Name is required");
	if (password && password !== confirm)
		return showFieldAlert(form, "Passwords do not match.");

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
		}
	} catch {
		showFieldAlert(form, "Error connecting to server.");
		console.error(err);
	}
});

// Delete bookmarks
document.addEventListener("click", async (e) => {
	if (!e.target.classList.contains("remove-bookmark-btn")) return;
	const tourId = e.target.dataset.tourId;
	if (!confirm("Are you sure you want to remove this bookmark?")) return;

	try {
		const res = await fetch(`/user/bookmark/${tourId}`, {
			method: "DELETE",
		});
		const result = await res.json();
		if (result.success) {
			e.target.closest(".col").remove();
			const grid = sections.bookmarks.querySelector(".row");
			if (!grid || !grid.children.length) {
				sections.bookmarks.innerHTML = `<h3 class="mb-4"><i class="bi bi-bookmarks-fill"></i> Your Bookmarks</h3><p>You have not bookmarked any tours yet.</p>`;
			}
		} else alert("❌ Failed to remove bookmark.");
	} catch {
		alert("⚠️ Something went wrong.");
	}
});

window.addEventListener("DOMContentLoaded", () => {
	loadMemberInfo();
	handleHash();
	window.addEventListener("hashchange", handleHash);
	tabs.info.onclick = () => showSection("info");
	tabs.bookmarks.onclick = () => showSection("bookmarks");
	tabs.bookings.onclick = () => showSection("bookings");
});
