// ==========================================================================
// Login Page Controller - Sports Buddy Application
// ==========================================================================

// Declare Utils variable before using it
const Utils = {
  isValidEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  showLoading: (message) => console.log(message),
  hideLoading: () => console.log("Loading hidden"),
  showNotification: (message, type) =>
    console.log(`Notification (${type}): ${message}`),
  storage: {
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
    get: (key) => JSON.parse(localStorage.getItem(key)),
    remove: (key) => localStorage.removeItem(key),
  },
  getLocalStorage: (key) => localStorage.getItem(key),
  setLocalStorage: (key, value) => localStorage.setItem(key, value),
  removeLocalStorage: (key) => localStorage.removeItem(key),
};

class LoginPage {
  constructor() {
    this.init();
    this.setupToggleButtons();
  }

  init() {
    this.setupEventListeners();
    this.setupPasswordToggle();
    this.checkRememberedUser();
    window.Logger.logInfo("Login page initialized");
  }

  setupEventListeners() {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", this.handleLogin.bind(this));
    }

    // Real-time validation
    const inputs = ["email", "password"];
    inputs.forEach((inputName) => {
      const input = document.getElementById(inputName);
      if (input) {
        input.addEventListener("blur", () => this.validateField(inputName));
        input.addEventListener("input", () => this.clearFieldError(inputName));
      }
    });

    // Forgot password link
    const forgotPasswordLink = document.getElementById("forgot-password");
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener(
        "click",
        this.handleForgotPassword.bind(this)
      );
    }
  }

  setupPasswordToggle() {
    const toggle = document.getElementById("password-toggle");
    const input = document.getElementById("password");

    if (toggle && input) {
      toggle.addEventListener("click", () => {
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        toggle.innerHTML = `<i class="fas fa-${
          isPassword ? "eye-slash" : "eye"
        }"></i>`;
      });
    }
  }

  checkRememberedUser() {
    const rememberedEmail = window.Utils.getLocalStorage("rememberedEmail");
    if (rememberedEmail) {
      const emailInput = document.getElementById("email");
      const rememberCheckbox = document.getElementById("remember");

      if (emailInput) emailInput.value = rememberedEmail;
      if (rememberCheckbox) rememberCheckbox.checked = true;
    }
  }

  validateField(fieldName) {
    const input = document.getElementById(fieldName);
    if (!input) return;

    const value = input.value.trim();

    switch (fieldName) {
      case "email":
        if (!value) {
          this.showFieldError(fieldName, "Email is required");
        } else if (!window.Utils.isValidEmail(value)) {
          this.showFieldError(fieldName, "Please enter a valid email address");
        } else {
          this.showFieldSuccess(fieldName);
        }
        break;

      case "password":
        if (!value) {
          this.showFieldError(fieldName, "Password is required");
        } else if (value.length < 6) {
          this.showFieldError(
            fieldName,
            "Password must be at least 6 characters"
          );
        } else {
          this.showFieldSuccess(fieldName);
        }
        break;
    }
  }

  showFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const inputElement = document.getEle222222222222222222222222mentById(fieldName);

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
  authRole = "user";

  setupToggleButtons() {
    const toggleButtons = document.querySelectorAll(".toggle-btn");
    toggleButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        toggleButtons.forEach((b) => b.classList.remove("active"));
        e.currentTarget.classList.add("active");

        this.authRole = e.currentTarget.dataset.type; // 'user' or 'admin'

        console.log(this.authRole);

        // Optionally update subtitle
        const subtitle = document.querySelector(".auth-subtitle");
        if (subtitle) {
          subtitle.textContent =
            this.authRole === "admin"
              ? "Sign in to your Admin dashboard"
              : "Sign in to your Sports Buddy account";
        }
      });
    });
  }

  async handleLogin(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const loginData = {
      email: formData.get("email").trim(),
      password: formData.get("password"),
      remember: formData.get("remember"),
    };

    // Validate form
    const validation = this.validateLoginForm(loginData);
    if (!validation.isValid) {
      this.displayValidationErrors(validation.errors);
      return;
    }

    console.log(this.authRole);

    try {
      window.Utils.showLoading("Signing you in...");

      const result = await window.AutManager.signInUser(
        loginData.email,
        loginData.password,
        this.authRole
      );

      window.Utils.hideLoading();

      if (result.success) {
        // Handle remember me
        if (loginData.remember) {
          window.Utils.setLocalStorage("rememberedEmail", loginData.email);
        } else {
          window.Utils.removeLocalStorage("rememberedEmail");
        }

        window.Utils.showNotification(result.message, "success");

        // Redirect based on user role
        setTimeout(() => {
          if (result.user.role === "admin") {
            window.location.href = "admin-dashboard.html";
          } else {
            window.location.href = "user-dashboard.html";
          }
        }, 1000);
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
      window.Logger.logError("Login error", { error: error.message });
    }
  }

  validateLoginForm(loginData) {
    const errors = {};

    // Email validation
    if (!loginData.email) {
      errors.email = "Email is required";
    } else if (!window.Utils.isValidEmail(loginData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!loginData.password) {
      errors.password = "Password is required";
    } else if (loginData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
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

  async handleForgotPassword(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();

    if (!email) {
      window.Utils.showNotification(
        "Please enter your email address first",
        "warning"
      );
      document.getElementById("email").focus();
      return;
    }

    if (!window.Utils.isValidEmail(email)) {
      window.Utils.showNotification(
        "Please enter a valid email address",
        "error"
      );
      document.getElementById("email").focus();
      return;
    }

    try {
      window.Utils.showLoading("Sending reset email...");

      const result = await window.AutManager.resetPassword(email);

      window.Utils.hideLoading();

      if (result.success) {
        window.Utils.showNotification(result.message, "success");
      } else {
        window.Utils.showNotification(result.error, "error");
      }
    } catch (error) {
      window.Utils.hideLoading();
      window.Utils.showNotification("Failed to send reset email", "error");
      window.Logger.logError("Password reset error", { error: error.message });
    }
  }
}

// Initialize login page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new LoginPage();
});
