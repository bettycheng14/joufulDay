const validateEmail = (email) => /^[^ ]+@[^ ]+\.[a-z]{2,3}$/.test(email);
const validatePasswordStrength = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

// Field Validation Helper
function setupValidation(input, errorEl, validators = []) {
  input.addEventListener("input", () => {
    let error = "";
    const value = input.value.trim();

    for (const validator of validators) {
      const result = validator(value);
      if (result !== true) {
        error = result;
        break;
      }
    }

    if (error) {
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");
      if (errorEl) errorEl.textContent = error;
    } else {
      input.classList.remove("is-invalid");
      input.classList.add("is-valid");
      if (errorEl) errorEl.textContent = "";
    }
  });
}

// Login Form
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginEmailError = document.getElementById("loginEmailError");
const loginPasswordError = document.getElementById("loginPasswordError");

setupValidation(loginEmail, loginEmailError, [
  (v) => (v ? true : "Email is required."),
  (v) => (validateEmail(v) ? true : "Invalid email format."),
]);
setupValidation(loginPassword, loginPasswordError, [
  (v) => (v ? true : "Password is required."),
]);

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginEmail.dispatchEvent(new Event("input"));
  loginPassword.dispatchEvent(new Event("input"));

  if (!loginEmail.classList.contains("is-invalid") && !loginPassword.classList.contains("is-invalid")) {
    const loginBtn = loginForm.querySelector("button[type='submit']");
    loginBtn.disabled = true;
    loginBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Logging In...`;

    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.value.trim(), password: loginPassword.value.trim() }),
      });

      if (res.redirected) {
        window.location.href = res.url;
      } else {
        const text = await res.text();
        showFieldAlert(loginForm, text, "danger");
        loginBtn.disabled = false;
        loginBtn.innerHTML = "Login";
      }
    } catch (err) {
      showFieldAlert(loginForm, "Error connecting to server.", "danger");
      console.error(err);
      loginBtn.disabled = false;
      loginBtn.innerHTML = "Login";
    }
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
const signupConfirmPasswordError = document.getElementById("signupConfirmPasswordError");

// Real-time validation
setupValidation(signupName, signupNameError, [(v) => (v ? true : "Name is required.")]);
setupValidation(signupEmail, signupEmailError, [
  (v) => (v ? true : "Email is required."),
  (v) => (validateEmail(v) ? true : "Invalid email format."),
]);
setupValidation(signupPassword, signupPasswordError, [
  (v) => (v ? true : "Password is required."),
  (v) => (validatePasswordStrength(v) ? true : "Password must include at least 8 chars, uppercase, lowercase & number."),
]);
setupValidation(signupConfirmPassword, signupConfirmPasswordError, [
  (v) => (v ? true : "Confirm your password."),
  (v) => (v === signupPassword.value.trim() ? true : "Passwords do not match."),
]);

signupPassword.addEventListener("input", () => signupConfirmPassword.dispatchEvent(new Event("input")));

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  [signupName, signupEmail, signupPassword, signupConfirmPassword].forEach((el) =>
    el.dispatchEvent(new Event("input"))
  );

  if (
    !signupName.classList.contains("is-invalid") &&
    !signupEmail.classList.contains("is-invalid") &&
    !signupPassword.classList.contains("is-invalid") &&
    !signupConfirmPassword.classList.contains("is-invalid")
  ) {
    const signupBtn = signupForm.querySelector("button[type='submit']");
    signupBtn.disabled = true;
    signupBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Signing Up...`;

    try {
      const res = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName.value.trim(),
          email: signupEmail.value.trim(),
          password: signupPassword.value.trim(),
        }),
      });

      if (res.redirected) {
        window.location.href = res.url;
      } else {
        const text = await res.text();
        showFieldAlert(signupForm, text, "danger");
        signupBtn.disabled = false;
        signupBtn.innerHTML = "Sign Up";
      }
    } catch (err) {
      showFieldAlert(signupForm, "Error connecting to server.", "danger");
      console.error(err);
      signupBtn.disabled = false;
      signupBtn.innerHTML = "Sign Up";
    }
  }
});

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