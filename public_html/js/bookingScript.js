var forms = document.querySelectorAll(".needs-validation");
var dateInput = document.getElementById("date");

// Date validation (not earlier than today)
dateInput.addEventListener("input", function () {
	var today = new Date().toISOString().split("T")[0];
	if (dateInput.value <= today) {
		dateInput.setCustomValidity("Invalid");
	} else {
		dateInput.setCustomValidity("");
	}
	if (dateInput.value) {
		dateInput.classList.remove("is-valid", "is-invalid");
		dateInput.classList.add(
			dateInput.checkValidity() ? "is-valid" : "is-invalid"
		);
	}
});

// check all fields in forms
Array.prototype.slice.call(forms).forEach(function (form) {
	form.addEventListener(
		"submit",
		function (event) {
			var today = new Date().toISOString().split("T")[0];
			if (dateInput.value <= today) {
				dateInput.setCustomValidity("Invalid");
			} else {
				dateInput.setCustomValidity("");
			}

			if (!form.checkValidity()) {
				event.preventDefault();
				event.stopPropagation();
				form.classList.add("was-validated");
			} else {
				event.preventDefault();
				alert("Bookmarks added successfully!");

				form.reset();
				form.classList.remove("was-validated");
				form.querySelectorAll(".form-control").forEach((el) => {
					el.classList.remove("is-valid", "is-invalid");
				});

				// Close modal
				var modalEl = document.getElementById("bookTourModal");
				var modal = bootstrap.Modal.getInstance(modalEl);
				if (!modal) {
					modal = new bootstrap.Modal(modalEl);
				}
				modal.hide();
			}
		},
		false
	);
	// reset the modal when open the modal
	var modalEl = document.getElementById("bookTourModal");
	modalEl.addEventListener("show.bs.modal", function () {
		forms.forEach(function (form) {
			form.reset();
			form.classList.remove("was-validated");
			form.querySelectorAll(".form-control").forEach((el) => {
				el.classList.remove("is-valid", "is-invalid");
			});
		});
	});
});
