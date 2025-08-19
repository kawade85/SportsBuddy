// ==========================================================================
// Home Page Controller - Sports Buddy Application
// ==========================================================================

class HomePage {
  constructor() {
    this.init()
  }

  init() {
    this.setupEventListeners()
    this.setupAnimations()
    this.updateStats()
    window.Logger.logInfo("Home page initialized")
  }

  setupEventListeners() {
    // CTA buttons
    const getStartedBtns = document.querySelectorAll(".btn-get-started")
    getStartedBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        window.location.href = "register.html"
      })
    })

    const learnMoreBtns = document.querySelectorAll(".btn-learn-more")
    learnMoreBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelector(".features").scrollIntoView({
          behavior: "smooth",
        })
      })
    })

    // Navigation smooth scrolling
    const navLinks = document.querySelectorAll('a[href^="#"]')
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const targetId = link.getAttribute("href").substring(1)
        const targetElement = document.getElementById(targetId)

        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      })
    })

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector(".mobile-menu-btn")
    const navMenu = document.querySelector(".nav-menu")

    if (mobileMenuBtn && navMenu) {
      mobileMenuBtn.addEventListener("click", () => {
        navMenu.classList.toggle("active")
      })
    }
  }

  setupAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in")
        }
      })
    }, observerOptions)

    // Observe elements for animation
    const animateElements = document.querySelectorAll(".feature-card, .step-card, .stat-item")

    animateElements.forEach((el) => {
      observer.observe(el)
    })

    // Hero text animation
    const heroTitle = document.querySelector(".hero-title")
    const heroSubtitle = document.querySelector(".hero-subtitle")
    const heroButtons = document.querySelector(".hero-buttons")

    if (heroTitle) {
      setTimeout(() => heroTitle.classList.add("animate-fade-in"), 200)
    }
    if (heroSubtitle) {
      setTimeout(() => heroSubtitle.classList.add("animate-fade-in"), 400)
    }
    if (heroButtons) {
      setTimeout(() => heroButtons.classList.add("animate-fade-in"), 600)
    }
  }

  updateStats() {
    // Simulate real-time stats (in production, these would come from API)
    const stats = {
      users: 15420,
      events: 8750,
      matches: 12300,
      cities: 45,
    }

    // Animate numbers when stats section comes into view
    const statsSection = document.querySelector(".stats")
    if (!statsSection) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.animateStats(stats)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.5 },
    )

    observer.observe(statsSection)
  }

  animateStats(stats) {
    const statElements = {
      "users-count": stats.users,
      "events-count": stats.events,
      "matches-count": stats.matches,
      "cities-count": stats.cities,
    }

    Object.entries(statElements).forEach(([id, finalValue]) => {
      const element = document.getElementById(id)
      if (element) {
        this.animateNumber(element, 0, finalValue, 2000)
      }
    })
  }

  animateNumber(element, start, end, duration) {
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const current = Math.floor(start + (end - start) * easeOutQuart)

      element.textContent = current.toLocaleString()

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        element.textContent = end.toLocaleString()
      }
    }

    animate()
  }

  // Newsletter subscription (if implemented)
  async handleNewsletterSignup(email) {
    try {
      window.Utils.showLoading("Subscribing...")

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      window.Utils.hideLoading()
      window.Utils.showNotification("Successfully subscribed to newsletter!", "success")

      window.Logger.logUserAction("Newsletter subscription", { email })
    } catch (error) {
      window.Utils.hideLoading()
      window.Utils.showNotification("Failed to subscribe. Please try again.", "error")
      window.Logger.logError("Newsletter subscription error", { error: error.message })
    }
  }
}

// Initialize home page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new HomePage()
})
