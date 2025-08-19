// ==========================================================================
// Utility Functions - Sports Buddy Application
// ==========================================================================

window.Utils = {
  // Data for select fields
  sportsData: [
    { id: "football", name: "Football", icon: "fas fa-futbol" },
    { id: "basketball", name: "Basketball", icon: "fas fa-basketball-ball" },
    { id: "tennis", name: "Tennis", icon: "fas fa-table-tennis" },
    { id: "swimming", name: "Swimming", icon: "fas fa-swimmer" },
    { id: "running", name: "Running", icon: "fas fa-running" },
    { id: "cycling", name: "Cycling", icon: "fas fa-bicycle" },
    { id: "volleyball", name: "Volleyball", icon: "fas fa-volleyball-ball" },
    { id: "badminton", name: "Badminton", icon: "fas fa-shuttlecock" },
    { id: "cricket", name: "Cricket", icon: "fas fa-baseball-ball" },
    { id: "golf", name: "Golf", icon: "fas fa-golf-ball" },
    { id: "hockey", name: "Hockey", icon: "fas fa-hockey-puck" },
    { id: "boxing", name: "Boxing", icon: "fas fa-fist-raised" },
    { id: "yoga", name: "Yoga", icon: "fas fa-spa" },
    { id: "gym", name: "Gym/Fitness", icon: "fas fa-dumbbell" },
    { id: "martial-arts", name: "Martial Arts", icon: "fas fa-fist-raised" },
  ],

  citiesData: [
    {
      id: "new-york",
      name: "New York",
      country: "United States",
      areas: [
        { id: "manhattan", name: "Manhattan" },
        { id: "brooklyn", name: "Brooklyn" },
        { id: "queens", name: "Queens" },
        { id: "bronx", name: "Bronx" },
        { id: "staten-island", name: "Staten Island" },
      ],
    },
    {
      id: "los-angeles",
      name: "Los Angeles",
      country: "United States",
      areas: [
        { id: "hollywood", name: "Hollywood" },
        { id: "beverly-hills", name: "Beverly Hills" },
        { id: "santa-monica", name: "Santa Monica" },
        { id: "downtown-la", name: "Downtown LA" },
        { id: "venice", name: "Venice" },
      ],
    },
    {
      id: "chicago",
      name: "Chicago",
      country: "United States",
      areas: [
        { id: "loop", name: "The Loop" },
        { id: "north-side", name: "North Side" },
        { id: "south-side", name: "South Side" },
        { id: "west-side", name: "West Side" },
        { id: "lincoln-park", name: "Lincoln Park" },
      ],
    },
    {
      id: "houston",
      name: "Houston",
      country: "United States",
      areas: [
        { id: "downtown-houston", name: "Downtown" },
        { id: "midtown", name: "Midtown" },
        { id: "montrose", name: "Montrose" },
        { id: "heights", name: "Heights" },
        { id: "galleria", name: "Galleria" },
      ],
    },
    {
      id: "miami",
      name: "Miami",
      country: "United States",
      areas: [
        { id: "south-beach", name: "South Beach" },
        { id: "downtown-miami", name: "Downtown" },
        { id: "coral-gables", name: "Coral Gables" },
        { id: "wynwood", name: "Wynwood" },
        { id: "brickell", name: "Brickell" },
      ],
    },
    {
      id: "london",
      name: "London",
      country: "United Kingdom",
      areas: [
        { id: "central-london", name: "Central London" },
        { id: "north-london", name: "North London" },
        { id: "south-london", name: "South London" },
        { id: "east-london", name: "East London" },
        { id: "west-london", name: "West London" },
      ],
    },
    {
      id: "toronto",
      name: "Toronto",
      country: "Canada",
      areas: [
        { id: "downtown-toronto", name: "Downtown" },
        { id: "north-york", name: "North York" },
        { id: "scarborough", name: "Scarborough" },
        { id: "etobicoke", name: "Etobicoke" },
        { id: "york", name: "York" },
      ],
    },
    {
      id: "sydney",
      name: "Sydney",
      country: "Australia",
      areas: [
        { id: "cbd", name: "CBD" },
        { id: "bondi", name: "Bondi" },
        { id: "manly", name: "Manly" },
        { id: "parramatta", name: "Parramatta" },
        { id: "chatswood", name: "Chatswood" },
      ],
    },
  ],

  // Populate select field with options
  populateSelect: (selectId, options, placeholder = "Select Option") => {
    const select = document.getElementById(selectId)
    if (!select) return

    select.innerHTML = `<option value="">${placeholder}</option>`

    options.forEach((option) => {
      const optionElement = document.createElement("option")
      optionElement.value = option.id || option.value
      optionElement.textContent = option.name || option.text || option.label
      select.appendChild(optionElement)
    })
  },

  // Populate sports select
  populateSportsSelect: function (selectId, placeholder = "Select Sport") {
    this.populateSelect(selectId, this.sportsData, placeholder)
  },

  // Populate cities select
  populateCitiesSelect: function (selectId, placeholder = "Select City") {
    this.populateSelect(selectId, this.citiesData, placeholder)
  },

  // Populate areas select based on selected city
  populateAreasSelect: function (selectId, cityId, placeholder = "Select Area") {
    const select = document.getElementById(selectId)
    if (!select) return

    select.innerHTML = `<option value="">${placeholder}</option>`

    if (cityId) {
      const city = this.citiesData.find((c) => c.id === cityId)
      if (city && city.areas) {
        city.areas.forEach((area) => {
          const option = document.createElement("option")
          option.value = area.id
          option.textContent = area.name
          select.appendChild(option)
        })
      }
    }
  },

  // Get city by ID
  getCityById: function (cityId) {
    return this.citiesData.find((city) => city.id === cityId)
  },

  // Get sport by ID
  getSportById: function (sportId) {
    return this.sportsData.find((sport) => sport.id === sportId)
  },

  // Validation functions
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  isValidPhone: (phone) => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/[\s\-$$$$]/g, ""))
  },

  validatePassword: (password) => {
    const minLength = password.length >= 6
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    let strength = "weak"
    let message = "Password is too weak"
    let score = 0

    if (minLength) score++
    if (hasUpper) score++
    if (hasLower) score++
    if (hasNumber) score++
    if (hasSpecial) score++

    if (score >= 4) {
      strength = "strong"
      message = "Strong password"
    } else if (score >= 2) {
      strength = "medium"
      message = "Medium strength password"
    }

    return { strength, message, score }
  },

  // Date and time utilities
  formatDate: (date) => {
    if (!date) return ""
    const d = new Date(date)
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  },

  formatDateTime: (date) => {
    if (!date) return ""
    const d = new Date(date)
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  },

  timeAgo: (date) => {
    if (!date) return ""
    const now = new Date()
    const past = new Date(date)
    const diffInSeconds = Math.floor((now - past) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
    return `${Math.floor(diffInSeconds / 31536000)} years ago`
  },

  // UI utilities
  showLoading: (message = "Loading...") => {
    const overlay = document.getElementById("loading-overlay")
    if (overlay) {
      const messageEl = overlay.querySelector("p")
      if (messageEl) messageEl.textContent = message
      overlay.classList.add("active")
    }
  },

  hideLoading: () => {
    const overlay = document.getElementById("loading-overlay")
    if (overlay) {
      overlay.classList.remove("active")
    }
  },

  showNotification: (message, type = "info", duration = 5000) => {
    const notification = document.getElementById("notification")
    if (!notification) return

    notification.textContent = message
    notification.className = `notification ${type}`
    notification.classList.add("show")

    setTimeout(() => {
      notification.classList.remove("show")
    }, duration)
  },

  // Device detection
  isMobile: () => window.innerWidth <= 768,

  isTablet: () => window.innerWidth > 768 && window.innerWidth <= 1024,

  isDesktop: () => window.innerWidth > 1024,

  // Debounce function
  debounce: (func, wait) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  // Throttle function
  throttle: (func, limit) => {
    let inThrottle
    return function () {
      const args = arguments
      
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  },

  // Form utilities
  resetFormStyling: (form) => {
    const inputs = form.querySelectorAll(".form-input")
    const errors = form.querySelectorAll(".form-error")

    inputs.forEach((input) => {
      input.classList.remove("error", "success")
    })

    errors.forEach((error) => {
      error.textContent = ""
    })
  },

  displayFormErrors: (errors) => {
    // Clear previous errors
    document.querySelectorAll(".form-error").forEach((error) => {
      error.textContent = ""
    })

    document.querySelectorAll(".form-input").forEach((input) => {
      input.classList.remove("error")
    })

    // Show new errors
    for (const [field, message] of Object.entries(errors)) {
      const errorElement = document.getElementById(`${field}-error`)
      const inputElement = document.getElementById(field)

      if (errorElement) {
        errorElement.textContent = message
      }

      if (inputElement) {
        inputElement.classList.add("error")
      }
    }

    // Scroll to first error
    const firstErrorField = Object.keys(errors)[0]
    if (firstErrorField) {
      const firstErrorElement = document.getElementById(firstErrorField)
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" })
        firstErrorElement.focus()
      }
    }
  },

  // Local storage utilities
  setLocalStorage: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error("Error saving to localStorage:", error)
    }
  },

  getLocalStorage: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error("Error reading from localStorage:", error)
      return defaultValue
    }
  },

  removeLocalStorage: (key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error("Error removing from localStorage:", error)
    }
  },

  // URL utilities
  getQueryParam: (param) => {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get(param)
  },

  setQueryParam: (param, value) => {
    const url = new URL(window.location)
    url.searchParams.set(param, value)
    window.history.pushState({}, "", url)
  },

  // Animation utilities
  fadeIn: (element, duration = 300) => {
    element.style.opacity = "0"
    element.style.display = "block"

    let start = null
    function animate(timestamp) {
      if (!start) start = timestamp
      const progress = timestamp - start
      const opacity = Math.min(progress / duration, 1)

      element.style.opacity = opacity

      if (progress < duration) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  },

  fadeOut: (element, duration = 300) => {
    let start = null
    const initialOpacity = Number.parseFloat(getComputedStyle(element).opacity)

    function animate(timestamp) {
      if (!start) start = timestamp
      const progress = timestamp - start
      const opacity = Math.max(initialOpacity - progress / duration, 0)

      element.style.opacity = opacity

      if (progress < duration) {
        requestAnimationFrame(animate)
      } else {
        element.style.display = "none"
      }
    }

    requestAnimationFrame(animate)
  },

  // Initialize select fields on page load
  initializeSelects: function () {
    // Initialize sports selects
    const sportsSelects = document.querySelectorAll('[data-select="sports"]')
    sportsSelects.forEach((select) => {
      this.populateSportsSelect(select.id)
    })

    // Initialize cities selects
    const citiesSelects = document.querySelectorAll('[data-select="cities"]')
    citiesSelects.forEach((select) => {
      this.populateCitiesSelect(select.id)
    })

    // Setup city-area dependencies
    const citySelects = document.querySelectorAll("[data-areas-target]")
    citySelects.forEach((citySelect) => {
      const areasTargetId = citySelect.getAttribute("data-areas-target")
      citySelect.addEventListener("change", (e) => {
        this.populateAreasSelect(areasTargetId, e.target.value)
      })
    })
  },
}

// Initialize selects when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.Utils.initializeSelects()
})
