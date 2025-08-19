// ==========================================================================
// User Dashboard Controller - Sports Buddy Application
// ==========================================================================

class UserDashboard {
  constructor() {
    this.currentSection = "dashboard";
    this.userEvents = [];
    this.suggestedMatches = [];
    this.sports = [];
    this.cities = [];
    this.areas = [];
    this.init();
  }

  async init() {
    if (!window.AutManager.requireAuth("user")) return;

    this.setupEventListeners();
    this.setupNavigation();
    this.setupMobileMenu();
    await this.loadInitialData();
    this.updateUserProfile();

    window.Logger.logInfo("User dashboard initialized");
  }

  setupEventListeners() {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", async (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        if (section) {
          await this.showSection(section);
        }
      });
    });

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn)
      logoutBtn.addEventListener("click", this.handleLogout.bind(this));

    const createEventForm = document.getElementById("create-event-form");
    if (createEventForm) {
      createEventForm.addEventListener(
        "submit",
        this.handleCreateEvent.bind(this)
      );
    }

    const cancelEventBtn = document.getElementById("cancel-event");
    if (cancelEventBtn) {
      cancelEventBtn.addEventListener("click", () =>
        this.showSection("events")
      );
    }

    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document
          .querySelectorAll(".filter-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.filterEvents(btn.dataset.filter);
      });
    });

    const eventsSearch = document.getElementById("events-search");
    if (eventsSearch) {
      const Utils = window.Utils;
      eventsSearch.addEventListener(
        "input",
        Utils.debounce((e) => this.searchEvents(e.target.value), 300)
      );
    }
  }

  setupNavigation() {
    this.updateActiveNavItem();
  }

  setupMobileMenu() {
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebar-toggle");

    if (mobileMenuBtn && sidebar) {
      mobileMenuBtn.addEventListener("click", () => {
        sidebar.classList.add("active");
      });
    }

    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener("click", () => {
        sidebar.classList.remove("active");
      });
    }

    document.addEventListener("click", (e) => {
      if (window.Utils.isMobile() && sidebar.classList.contains("active")) {
        if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
          sidebar.classList.remove("active");
        }
      }
    });
  }

  async loadInitialData() {
    try {
      window.Utils.showLoading("Loading dashboard...");
      await Promise.all([
        this.loadUserEvents(),
        this.loadSuggestedMatches(),
        this.loadSportsAndLocations(),
        this.updateDashboardStats(),
      ]);
      window.Utils.hideLoading();
    } catch (error) {
      window.Utils.hideLoading();
      window.Utils.showNotification("Failed to load dashboard data", "error");
      window.Logger.logError("Dashboard data loading failed", {
        error: error.message,
      });
    }
  }

  updateUserProfile() {
    const user = window.AutManager.getCurrentUser();
    if (user) {
      const nameEl = document.getElementById("user-name");
      const avatarEl = document.getElementById("user-avatar");
      if (nameEl) nameEl.textContent = `${user.firstName} ${user.lastName}`;
      if (avatarEl) avatarEl.alt = `${user.firstName} ${user.lastName}`;
    }
  }

  async loadUserEvents() {
    try {
      const user = window.AutManager.getCurrentUser();
      this.userEvents = await window.EventsManager.getUserEvents(user.uid);
      this.displayRecentEvents();
    } catch (error) {
      window.Logger.logError("Failed to load user events", {
        error: error.message,
      });
    }
  }

  async loadSuggestedMatches() {
    try {
      const user = window.AutManager.getCurrentUser();
      this.suggestedMatches = await window.EventsManager.findMatchingEvents(
        user.uid
      );
      this.displaySuggestedMatches();
    } catch (error) {
      window.Logger.logError("Failed to load suggested matches", {
        error: error.message,
      });
    }
  }

  async loadSportsAndLocations() {
    try {
      this.sports = window.Utils.sportsData;
      this.cities = window.Utils.citiesData;
      this.populateFormSelects();
    } catch (error) {
      window.Logger.logError("Failed to load sports and locations", {
        error: error.message,
      });
    }
  }

  populateFormSelects() {
    window.Utils.populateSportsSelect("event-sport", "Select Sport");
    window.Utils.populateCitiesSelect("event-city", "Select City");

    const citySelect = document.getElementById("event-city");
    if (citySelect) {
      citySelect.addEventListener("change", (e) => {
        window.Utils.populateAreasSelect(
          "event-area",
          e.target.value,
          "Select Area"
        );
      });
    }
  }

  async updateDashboardStats() {
    try {
      const user = window.AutManager.getCurrentUser();
      const stats = user.stats || {};
      document.getElementById("total-events").textContent =
        stats.eventsCreated || 0;
      document.getElementById("total-matches").textContent =
        stats.matchesFound || 0;
      document.getElementById("total-sports").textContent =
        stats.sportsPlayed || 0;
      document.getElementById("rating").textContent = (
        stats.rating || 0
      ).toFixed(1);
    } catch (error) {
      window.Logger.logError("Failed to update dashboard stats", {
        error: error.message,
      });
    }
  }

  displayRecentEvents() {
    const container = document.getElementById("recent-events");
    if (!container) return;

    if (this.userEvents.length === 0) {
      container.innerHTML = `
    <div class="empty-state" style="padding: 2rem; text-align: center; margin-top: 12px;">
      <div style="margin-bottom: 1rem;">
        <i class="fas fa-calendar-alt" style="font-size: 2rem; color: var(--primary-color);"></i>
      </div>
      <h3 style="margin-bottom: 0.5rem;">No Events Yet</h3>
      <p style="margin-bottom: 1.5rem;">Create your first sports event to get started!</p>
      <button class="btn btn-primary" style="gap: 0.5rem;" onclick="dashboard.showSection('create-event')">
        <i class="fas fa-plus"></i> Create Event
      </button>
    </div>
  `;
      return;
    }

    container.innerHTML = this.userEvents
      .slice(0, 3)
      .map(
        (e) => `
        <div class="event-item" style="margin-bottom: 21px; border:">
          <div class="event-info">
            <h4>${e.title}</h4>
            <p><i class="fas fa-futbol"></i> ${e.sport}</p>
            <p><i class="fas fa-calendar"></i> ${window.Utils.formatDate(
              e.date
            )}</p>
          </div>
          <div class="event-status ${e.status}">${e.status}</div>
          <hr style="margin-top: 20px;">
        </div>
      `
      )
      .join("");
  }

  displaySuggestedMatches() {
    const container = document.getElementById("suggested-matches");
    if (!container) return;

    if (this.suggestedMatches.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-users"></i>
          <h3>No Matches Found</h3>
          <p>We'll suggest events based on your preferences.</p>
        </div>`;
      return;
    }

    container.innerHTML = this.suggestedMatches
      .slice(0, 3)
      .map(
        (m) => `
        <div class="match-item">
          <div class="match-info">
            <h4>${m.title}</h4>
            <p><i class="fas fa-map-marker-alt"></i> ${m.area}, ${m.city}</p>
            <p><i class="fas fa-users"></i> ${m.participantCount}/${m.maxParticipants}</p>
          </div>
          <button class="btn btn-sm btn-primary" onclick="dashboard.joinEvent('${m.id}')">Join</button>
        </div>
      `
      )
      .join("");
  }

  async showSection(sectionName) {
    document
      .querySelectorAll(".content-section")
      .forEach((s) => s.classList.remove("active"));

    const section = document.getElementById(`${sectionName}-section`);
    if (section) section.classList.add("active");

    this.currentSection = sectionName;
    this.updateActiveNavItem();

    const pageTitle = document.getElementById("page-title");
    if (pageTitle) {
      const titles = {
        dashboard: "Dashboard",
        events: "My Events",
        "create-event": "Create Event",
        matches: "Matches",
        profile: "Profile",
      };
      pageTitle.textContent = titles[sectionName] || "Dashboard";
    }

    // Section-specific logic
    if (sectionName === "events") {
      this.displayAllEvents();
    } else if (sectionName === "matches") {
      await this.loadSuggestedMatches();
    }

    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.remove("active");

    window.Logger.logUserAction("Section changed", { section: sectionName });
  }

  updateActiveNavItem() {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.toggle(
        "active",
        item.dataset.section === this.currentSection
      );
    });
  }

  displayAllEvents() {
    const container = document.getElementById("events-grid");
    if (!container) return;

    if (this.userEvents.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-calendar-alt"></i>
          <h3>No Events Yet</h3>
          <p>Create your first sports event to get started!</p>
          <button class="btn btn-primary" onclick="dashboard.showSection('create-event')">
            <i class="fas fa-plus"></i> Create Event
          </button>
        </div>`;
      return;
    }

    container.innerHTML = this.userEvents
      .map((event) => this.createEventCard(event))
      .join("");
  }

  createEventCard(event) {
    const sport = this.sports.find((s) => s.id === event.sport);
    const sportIcon = sport?.icon || "fas fa-futbol";
    const isUpcoming = new Date(event.date) > new Date();

    return `
      <div class="event-card" onclick="dashboard.showEventDetails('${
        event.id
      }')">
        <div class="event-header">
          <h3 class="event-title">${event.title}</h3>
          <div class="event-sport"><i class="${sportIcon}"></i> ${
      sport?.name || event.sport
    }</div>
        </div>
        <div class="event-body">
          <p class="event-description">${event.description}</p>
          <div class="event-details">
            <div class="event-detail"><i class="fas fa-calendar"></i> ${window.Utils.formatDate(
              event.date
            )}</div>
            <div class="event-detail"><i class="fas fa-clock"></i> ${
              event.time
            }</div>
            <div class="event-detail"><i class="fas fa-map-marker-alt"></i> ${
              event.area
            }, ${event.city}</div>
            <div class="event-detail"><i class="fas fa-users"></i> ${
              event.participantCount
            }/${event.maxParticipants}</div>
          </div>
        </div>
        <div class="event-footer">
          <div class="event-status ${isUpcoming ? "upcoming" : "past"}">${
      isUpcoming ? "Upcoming" : "Past"
    }</div>
          <div class="event-actions">
            <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); dashboard.editEvent('${
              event.id
            }')"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); dashboard.deleteEvent('${
              event.id
            }')"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>`;
  }

  async handleCreateEvent(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const eventData = {
      title: formData.get("title").trim(),
      sport: formData.get("sport"),
      description: formData.get("description").trim(),
      date: formData.get("date"),
      time: formData.get("time"),
      city: formData.get("city"),
      area: formData.get("area"),
      skillLevel: formData.get("skillLevel"),
      maxParticipants: Number(formData.get("maxParticipants")),
    };

    const validation = this.validateEventForm(eventData);
    if (!validation.isValid) {
      window.Utils.displayFormErrors(validation.errors);
      return;
    }

    try {
      window.Utils.showLoading("Creating event...");
      const result = await window.EventsManager.createEvent(eventData);
      window.Utils.hideLoading();

      if (result.success) {
        window.Utils.showNotification(result.message, "success");
        event.target.reset();
        await this.loadUserEvents();
        this.showSection("events");
      } else {
        window.Utils.showNotification(result.error, "error");
      }
    } catch (error) {
      window.Utils.hideLoading();
      window.Utils.showNotification("Failed to create event", "error");
      window.Logger.logError("Create event error", { error: error.message });
    }
  }

  validateEventForm(data) {
    const errors = {};
    const required = [
      "title",
      "sport",
      "description",
      "date",
      "time",
      "city",
      "area",
      "skillLevel",
    ];
    required.forEach((f) => {
      if (!data[f]) errors[f] = "This field is required";
    });

    const date = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) errors.date = "Event date cannot be in the past";

    if (
      !data.maxParticipants ||
      data.maxParticipants < 2 ||
      data.maxParticipants > 50
    ) {
      errors.maxParticipants = "Participants must be between 2 and 50";
    }

    return { isValid: Object.keys(errors).length === 0, errors };
  }

  async joinEvent(eventId) {
    try {
      window.Utils.showLoading("Joining event...");
      const result = await window.EventsManager.joinEvent(eventId);
      window.Utils.hideLoading();

      if (result.success) {
        window.Utils.showNotification(result.message, "success");
        await this.loadSuggestedMatches();
      } else {
        window.Utils.showNotification(result.error, "error");
      }
    } catch (error) {
      window.Utils.hideLoading();
      window.Utils.showNotification("Failed to join event", "error");
      window.Logger.logError("Join event error", { error: error.message });
    }
  }

  async deleteEvent(eventId) {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      window.Utils.showLoading("Deleting event...");
      const result = await window.EventsManager.deleteEvent(eventId);
      window.Utils.hideLoading();

      if (result.success) {
        window.Utils.showNotification(result.message, "success");
        await this.loadUserEvents();
        this.displayAllEvents();
      } else {
        window.Utils.showNotification(result.error, "error");
      }
    } catch (error) {
      window.Utils.hideLoading();
      window.Utils.showNotification("Failed to delete event", "error");
      window.Logger.logError("Delete event error", { error: error.message });
    }
  }

  filterEvents(filter) {
    window.Logger.logUserAction("Events filtered", { filter });
  }

  searchEvents(query) {
    window.Logger.logUserAction("Events searched", { query });
  }

  showEventDetails(eventId) {
    window.Logger.logUserAction("Event details viewed", { eventId });
  }

  editEvent(eventId) {
    window.Logger.logUserAction("Event edit initiated", { eventId });
  }

  async handleLogout() {
    if (!confirm("Are you sure you want to logout?")) return;

    try {
      window.Utils.showLoading("Signing out...");
      const result = await window.AutManager.signOutUser();
      window.Utils.hideLoading();

      if (result.success) {
        window.Utils.showNotification(result.message, "success");
        setTimeout(() => (window.location.href = "index.html"), 1000);
      } else {
        window.Utils.showNotification(result.error, "error");
      }
    } catch (error) {
      window.Utils.hideLoading();
      window.Utils.showNotification("Error signing out", "error");
      window.Logger.logError("Logout error", { error: error.message });
    }
  }
}

// Bootstrap the dashboard
let dashboard;
document.addEventListener("DOMContentLoaded", () => {
  dashboard = new UserDashboard();
});
