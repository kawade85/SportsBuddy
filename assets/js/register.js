// ==========================================================================
// Register Page Controller - Sports Buddy Application
// ==========================================================================

class RegisterPage {
  constructor() {
    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.setupPasswordToggles();
    this.setupPasswordStrength();
    this.populateSelects();
    window.Logger.logInfo("Register page initialized");
  }

  populateSelects() {
    // Populate city select
    window.Utils.populateCitiesSelect("city", "Select City");

    // Setup city-area dependency
    const citySelect = document.getElementById("city");
    const areaSelect = document.getElementById("area");

    if (citySelect && areaSelect) {
      citySelect.addEventListener("change", (e) => {
        window.Utils.populateAreasSelect("area", e.target.value, "Select Area");
      });
    }
  }

  setupEventListeners() {
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
      registerForm.addEventListener(
        "submit",
        this.handleRegistration.bind(this)
      );
    }

    // Real-time validation
    const inputs = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "password",
      "confirmPassword",
    ];
    inputs.forEach((inputName) => {
      const input = document.getElementById(inputName);
      if (input) {
        input.addEventListener("blur", () => this.validateField(inputName));
        input.addEventListener("input", () => this.clearFieldError(inputName));
      }
    });
  }

  setupPasswordToggles() {
    const toggles = [
      { toggleId: "password-toggle", inputId: "password" },
      { toggleId: "confirm-password-toggle", inputId: "confirmPassword" },
    ];

    toggles.forEach(({ toggleId, inputId }) => {
      const toggle = document.getElementById(toggleId);
      const input = document.getElementById(inputId);

      if (toggle && input) {
        toggle.addEventListener("click", () => {
          const isPassword = input.type === "password";
          input.type = isPassword ? "text" : "password";
          toggle.innerHTML = `<i class="fas fa-${
            isPassword ? "eye-slash" : "eye"
          }"></i>`;
        });
      }
    });
  }

  setupPasswordStrength() {
    const passwordInput = document.getElementById("password");
    const strengthIndicator = document.getElementById("password-strength");

    if (passwordInput && strengthIndicator) {
      passwordInput.addEventListener("input", (e) => {
        const password = e.target.value;
        if (password.length > 0) {
          const strength = window.Utils.validatePassword(password);
          this.updatePasswordStrength(strengthIndicator, strength);
        } else {
          strengthIndicator.textContent = "";
          strengthIndicator.className = "password-strength";
        }
      });
    }
  }

  updatePasswordStrength(indicator, strength) {
    indicator.textContent = strength.message;
    indicator.className = `password-strength ${strength.strength}`;
  }

  validateField(fieldName) {
    const input = document.getElementById(fieldName);
    if (!input) return;

    const value = input.value.trim();

    switch (fieldName) {
      case "firstName":
      case "lastName":
        if (!value) {
          this.showFieldError(fieldName, "This field is required");
        } else if (value.length < 2) {
          this.showFieldError(fieldName, "Must be at least 2 characters");
        } else {
          this.showFieldSuccess(fieldName);
        }
        break;

      case "email":
        if (!value) {
          this.showFieldError(fieldName, "Email is required");
        } else if (!window.Utils.isValidEmail(value)) {
          this.showFieldError(fieldName, "Please enter a valid email address");
        } else {
          this.showFieldSuccess(fieldName);
        }
        break;

      case "phone":
        if (!value) {
          this.showFieldError(fieldName, "Phone number is required");
        } else if (!window.Utils.isValidPhone(value)) {
          this.showFieldError(fieldName, "Please enter a valid phone number");
        } else {
          this.showFieldSuccess(fieldName);
        }
        break;

      case "password":
        if (!value) {
          this.showFieldError(fieldName, "Password is required");
        } else {
          const strength = window.Utils.validatePassword(value);
          if (value.length < 6) {
            this.showFieldError(
              fieldName,
              "Password must be at least 6 characters"
            );
          } else if (strength.strength === "weak") {
            this.showFieldError(fieldName, "Password is too weak");
          } else {
            this.showFieldSuccess(fieldName);
          }
        }
        break;

      case "confirmPassword":
        const password = document.getElementById("password").value;
        if (!value) {
          this.showFieldError(fieldName, "Please confirm your password");
        } else if (value !== password) {
          this.showFieldError(fieldName, "Passwords do not match");
        } else {
          this.showFieldSuccess(fieldName);
        }
        break;
    }
  }

  showFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const inputElement = document.getElementById(fieldName);

    if (errorElement) {
      errorElement.textContent = message;
    }

    if (inputElement) {
      inputElement.classList.add("error");
      inputElement.classList.remove("success");
    }
  }

  showFieldSuccess(fieldName) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const inputElement = document.getElementById(fieldName);

    if (errorElement) {
      errorElement.textContent = "";
    }

    if (inputElement) {
      inputElement.classList.remove("error");
      inputElement.classList.add("success");
    }
  }

  clearFieldError(fieldName) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const inputElement = document.getElementById(fieldName);

    if (errorElement) {
      errorElement.textContent = "";
    }

    if (inputElement) {
      inputElement.classList.remove("error");
    }
  }

  async handleRegistration(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const userData = {
      firstName: formData.get("firstName").trim(),
      lastName: formData.get("lastName").trim(),
      email: formData.get("email").trim(),
      phone: formData.get("phone").trim(),
      city: formData.get("city"),
      area: formData.get("area"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      terms: formData.get("terms"),
    };

    // Validate form
    const validation = this.validateRegistrationForm(userData);
    if (!validation.isValid) {
      this.displayValidationErrors(validation.errors);
      return;
    }

    try {
      window.Utils.showLoading("Creating your account...");

      const result = await window.AutManager.registerUser(userData);

      window.Utils.hideLoading();

      if (result.success) {
        window.Utils.showNotification(result.message, "success");

        // Redirect to user dashboard
        setTimeout(() => {
          window.location.href = "user-dashboard.html";
        }, 1500);
      } else {
        window.Utils.showNotification(result.error, "error");

        // Add shake animation to form
        const authCard = document.querySelector(".auth-card");
        authCard.classList.add("error");
        setTimeout(() => authCard.classList.remove("error"), 600);
      }
    } catch (error) {
      window.Utils.hideLoading();
      window.Utils.showNotification("An unexpected error occurred", "error");
      window.Logger.logError("Registration error", { error: error.message });
    }
  }

  validateRegistrationForm(userData) {
    const errors = {};

    // Required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "city",
      "area",
      "password",
    ];
    requiredFields.forEach((field) => {
      if (!userData[field]) {
        errors[field] = "This field is required";
      }
    });

    // Email validation
    if (userData.email && !window.Utils.isValidEmail(userData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (userData.phone && !window.Utils.isValidPhone(userData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    // Password validation
    if (userData.password) {
      if (userData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      } else {
        const strength = window.Utils.validatePassword(userData.password);
        if (strength.strength === "weak") {
          errors.password = "Password is too weak";
        }
      }
    }

    // Confirm password
    if (userData.password !== userData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    // Terms acceptance
    if (!userData.terms) {
      errors.terms = "You must accept the terms and conditions";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  displayValidationErrors(errors) {
    // Clear previous errors
    document.querySelectorAll(".form-error").forEach((error) => {
      error.textContent = "";
    });

    document.querySelectorAll(".form-input").forEach((input) => {
      input.classList.remove("error");
    });

    // Show new errors
    for (const [field, message] of Object.entries(errors)) {
      this.showFieldError(field, message);
    }

    // Scroll to first error
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const firstErrorElement = document.getElementById(firstErrorField);
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        firstErrorElement.focus();
      }
    }
  }
}

// Initialize register page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new RegisterPage();
});
