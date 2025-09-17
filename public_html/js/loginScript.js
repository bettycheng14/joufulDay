const validateEmail = (email) => {
	const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
	return emailPattern.test(email);
};

const validatePasswordStrength = (password) => {
	// At least 8 characters, 1 uppercase, 1 lowercase, 1 number
	const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
	return pattern.test(password);
};

// Login Form
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const loginEmailError = document.getElementById("loginEmailError");
const loginPasswordError = document.getElementById("loginPasswordError");
const loginSuccess = document.getElementById("loginSuccess");

loginEmail.addEventListener("input", () => {
	if (loginEmail.value.trim() === "") {
		loginEmail.classList.add("is-invalid");
		loginEmail.classList.remove("is-valid");
		loginEmailError.textContent = "Email is required.";
	} else if (!validateEmail(loginEmail.value.trim())) {
		loginEmail.classList.add("is-invalid");
		loginEmail.classList.remove("is-valid");
		loginEmailError.textContent = "Invalid email format.";
	} else {
		loginEmail.classList.remove("is-invalid");
		loginEmail.classList.add("is-valid");
		loginEmailError.textContent = "";
	}
});

loginPassword.addEventListener("input", () => {
	if (loginPassword.value.trim() === "") {
		loginPassword.classList.add("is-invalid");
		loginPassword.classList.remove("is-valid");
		loginPasswordError.textContent = "Password is required.";
	} else {
		loginPassword.classList.remove("is-invalid");
		loginPassword.classList.add("is-valid");
		loginPasswordError.textContent = "";
	}
});

loginForm.addEventListener("submit", (e) => {
	e.preventDefault();
	loginEmail.dispatchEvent(new Event("input"));
	loginPassword.dispatchEvent(new Event("input"));

	if (
		!loginEmail.classList.contains("is-invalid") &&
		!loginPassword.classList.contains("is-invalid")
	) {
		alert("Login successful.");
		loginForm.reset();
		loginEmail.classList.remove("is-valid");
		loginPassword.classList.remove("is-valid");
		// redirect to member page
		window.location.href = "member-information.html";
	}
});

// Sign Up Form
const signupForm = document.getElementById("signupForm");
const signupName = document.getElementById("signupName");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const signupConfirmPassword = document.getElementById("signupConfirmPassword");

const signupNameError = document.getElementById("signupNameError");
const signupEmailError = document.getElementById("signupEmailError");
const signupPasswordError = document.getElementById("signupPasswordError");
const signupConfirmPasswordError = document.getElementById(
	"signupConfirmPasswordError"
);
const signupSuccess = document.getElementById("signupSuccess");

signupName.addEventListener("input", () => {
	if (signupName.value.trim() === "") {
		signupName.classList.add("is-invalid");
		signupName.classList.remove("is-valid");
		signupNameError.textContent = "Name is required.";
	} else {
		signupName.classList.remove("is-invalid");
		signupName.classList.add("is-valid");
		signupNameError.textContent = "";
	}
});

signupEmail.addEventListener("input", () => {
	if (signupEmail.value.trim() === "") {
		signupEmail.classList.add("is-invalid");
		signupEmail.classList.remove("is-valid");
		signupEmailError.textContent = "Email is required.";
	} else if (!validateEmail(signupEmail.value.trim())) {
		signupEmail.classList.add("is-invalid");
		signupEmail.classList.remove("is-valid");
		signupEmailError.textContent = "Invalid email format.";
	} else {
		signupEmail.classList.remove("is-invalid");
		signupEmail.classList.add("is-valid");
		signupEmailError.textContent = "";
	}
});

signupPassword.addEventListener("input", () => {
	if (signupPassword.value.trim() === "") {
		signupPassword.classList.add("is-invalid");
		signupPassword.classList.remove("is-valid");
		signupPasswordError.textContent = "Password is required.";
	} else if (!validatePasswordStrength(signupPassword.value.trim())) {
		signupPassword.classList.add("is-invalid");
		signupPassword.classList.remove("is-valid");
		signupPasswordError.textContent =
			"Password must include at least 8 chars, include uppercase, lowercase & number.";
	} else {
		signupPassword.classList.remove("is-invalid");
		signupPassword.classList.add("is-valid");
		signupPasswordError.textContent = "";
	}
	signupConfirmPassword.dispatchEvent(new Event("input")); // recheck confirm password
});

signupConfirmPassword.addEventListener("input", () => {
	if (signupConfirmPassword.value.trim() === "") {
		signupConfirmPassword.classList.add("is-invalid");
		signupConfirmPassword.classList.remove("is-valid");
		signupConfirmPasswordError.textContent = "Confirm your password.";
	} else if (
		signupConfirmPassword.value.trim() !== signupPassword.value.trim()
	) {
		signupConfirmPassword.classList.add("is-invalid");
		signupConfirmPassword.classList.remove("is-valid");
		signupConfirmPasswordError.textContent = "Passwords do not match.";
	} else {
		signupConfirmPassword.classList.remove("is-invalid");
		signupConfirmPassword.classList.add("is-valid");
		signupConfirmPasswordError.textContent = "";
	}
});

signupForm.addEventListener("submit", (e) => {
	e.preventDefault();
	signupName.dispatchEvent(new Event("input"));
	signupEmail.dispatchEvent(new Event("input"));
	signupPassword.dispatchEvent(new Event("input"));
	signupConfirmPassword.dispatchEvent(new Event("input"));

	if (
		!signupName.classList.contains("is-invalid") &&
		!signupEmail.classList.contains("is-invalid") &&
		!signupPassword.classList.contains("is-invalid") &&
		!signupConfirmPassword.classList.contains("is-invalid")
	) {
		alert("Sign Up successful.");
		signupForm.reset();
		[
			signupName,
			signupEmail,
			signupPassword,
			signupConfirmPassword,
		].forEach((el) => el.classList.remove("is-valid"));
		// redirect to member page
		window.location.href = "member-information.html";
	}
});
