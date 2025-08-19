// admin-dashboard.js (Final Version with Modal Close + Add Event Support)
class AdminDashboard {
  constructor() {
    this.currentSection = "dashboard";
    this.users = [];
    this.events = [];
    this.sidebarActive = false; // Add this line
    this.init();
  }

  async init() {
    await this.loadDashboardStats();
    await this.loadUsers();
    await this.loadEvents();
    await this.loadRecentActivities();
    this.setupSidebar();
    this.attachEventListeners();

    // Event form submit
    const eventForm = document.getElementById("event-form");
    if (eventForm) {
      eventForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const eventId = document.getElementById("event-id").value;
        const updatedEvent = {
          title: document.getElementById("event-name").value,
          sport: document.getElementById("event-sport").value,
          city: document.getElementById("event-city").value,
          area: document.getElementById("event-area").value,
          date: document.getElementById("event-date").value,
          time: document.getElementById("event-time").value,
          skillLevel: document.getElementById("event-skill").value,
          maxParticipants: parseInt(document.getElementById("event-max").value),
          description: document.getElementById("event-description").value,
        };

        const result = await window.EventsManager.updateEvent(
          eventId,
          updatedEvent
        );
        if (result.success) {
          Utils.showNotification("Event updated successfully", "success");
          document.getElementById("event-modal").classList.remove("show");
          this.loadEvents();
        } else {
          Utils.showNotification(result.error, "error");
        }
      });
    }

    // Modal close button
    const closeBtn = document.getElementById("event-modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.showSection("events");
      });
    }

    // Cancel button
    const cancelBtn = document.getElementById("cancel-event");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.showSection("events");
      });
    }

    // City → Area linking
    const citySelect = document.getElementById("event-city");
    if (citySelect) {
      citySelect.addEventListener("change", (e) => {
        Utils.populateAreasSelect("event-area", e.target.value);
      });
    }

    // Add Event button
    const addEventBtn = document.getElementById("add-event-btn");
    if (addEventBtn) {
      addEventBtn.addEventListener("click", () => {
        document.getElementById("event-form").reset();
        document.getElementById("event-id").value = "";
        document.getElementById("event-modal-title").textContent = "Add Event";
        Utils.populateSportsSelect("event-sport");
        Utils.populateCitiesSelect("event-city");
        Utils.populateAreasSelect("event-area", "");
        document.getElementById("event-edit-section").classList.add("show");
      });
    }
  }

  // Add this method to handle sidebar functionality
  setupSidebar() {
    const sidebar = document.getElementById("sidebar");
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const sidebarToggle = document.getElementById("sidebar-toggle");

    // Create overlay element if it doesn't exist
    let overlay = document.getElementById("sidebar-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "sidebar-overlay";
      overlay.className = "sidebar-overlay";
      document.body.appendChild(overlay);
    }

    // Toggle sidebar function
    const toggleSidebar = () => {
      this.sidebarActive = !this.sidebarActive;
      sidebar.classList.toggle("active", this.sidebarActive);
      overlay.classList.toggle("active", this.sidebarActive);
      document.body.classList.toggle("sidebar-open", this.sidebarActive);
    };

    // Add event listeners
    mobileMenuBtn.addEventListener("click", toggleSidebar);
    sidebarToggle.addEventListener("click", toggleSidebar);
    overlay.addEventListener("click", toggleSidebar);

    // Close sidebar when clicking on a nav item on mobile
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        if (window.innerWidth <= 992 && this.sidebarActive) {
          toggleSidebar();
        }
      });
    });

    // Handle window resize
    window.addEventListener("resize", () => {
      if (window.innerWidth > 992 && this.sidebarActive) {
        toggleSidebar();
      }
    });

    // Add touch event support for better mobile experience
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      false
    );

    document.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      },
      false
    );

    const handleSwipe = () => {
      const swipeThreshold = 100;
      // Swipe right to open sidebar
      if (touchEndX - touchStartX > swipeThreshold && !this.sidebarActive) {
        toggleSidebar();
      }
      // Swipe left to close sidebar
      else if (touchStartX - touchEndX > swipeThreshold && this.sidebarActive) {
        toggleSidebar();
      }
    };
  }

  async loadEvents() {
    this.events = await window.AdminManager.getEvents();
    const tbody = document.getElementById("events-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!this.events.length) {
      tbody.innerHTML = `<tr><td colspan="7">No events found.</td></tr>`;
      return;
    }

    this.events.forEach((event, index) => {
      const city = Utils.getCityById(event.city);
      const areaObj = city?.areas?.find((a) => a.id === event.area);
      const sport = Utils.getSportById(event.sport);

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${event.title || "-"}</td>
        <td>${sport?.name || "-"}</td>
        <td>${city?.name || "-"}</td>
        <td>${areaObj?.name || "-"}</td>
        <td>${event.date || "-"}</td>
        <td>
          <button class="btn-edit-event" data-id="${event.id}">Edit</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    setTimeout(() => {
      tbody.querySelectorAll(".btn-edit-event").forEach((btn) => {
        btn.addEventListener("click", async () => {
          console.log("clicked!!");
          const eventId = btn.dataset.id;
          const event = await window.EventsManager.getEventById(eventId);
          if (!event) return alert("Event not found in database");
          console.log({ event });
          this.showEditEventModal(event);
        });
      });
    }, 50);
  }

  showEditEventModal(event) {
    document.getElementById("event-id").value = event.id;
    document.getElementById("event-name").value = event.title || "";
    document.getElementById("event-date").value = event.date || "";
    document.getElementById("event-time").value = event.time || "";
    document.getElementById("event-description").value =
      event.description || "";
    document.getElementById("event-skill").value = event.skillLevel || "";
    document.getElementById("event-max").value = event.maxParticipants || "";

    Utils.populateSportsSelect("event-sport");
    Utils.populateCitiesSelect("event-city");

    document.getElementById("event-sport").value = event.sport || "";
    document.getElementById("event-city").value = event.city || "";

    Utils.populateAreasSelect("event-area", event.city);
    document.getElementById("event-area").value = event.area || "";

    document.getElementById("event-modal-title").textContent = "Edit Event";
    // document.getElementById("event-modal").classList.remove("modal");
    // document.getElementById("event-modal").classList.add("show");
    // document
    //   .querySelectorAll(".content-section")
    //   .forEach((sec) => sec.classList.remove("active"));
    // document.getElementById("event-edit-section").classList.add("active");
    this.showSection("eventEdit");
    // modal.classList.remove("modal");
  }

  async loadDashboardStats() {
    const stats = await window.AdminManager.getDashboardStats();
    document.getElementById("total-users").textContent = stats.users;
    document.getElementById("total-events").textContent = stats.events;
  }

  async loadUsers() {
    this.users = await window.AdminManager.getUsers();
    const tbody = document.getElementById("users-tbody");
    tbody.innerHTML = "";

    this.users.forEach((user) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${user.fullName || user.email}</td>
        <td>${user.email}</td>
        <td>${user.cityName || "-"}</td>
        <td>${user.isActive ? "Active" : "Inactive"}</td>
        <td>
          <button class="btn-toggle-status" data-id="${user.id}" data-active="${
        user.isActive
      }">
            ${user.isActive ? "Deactivate" : "Activate"}
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });

    tbody.querySelectorAll(".btn-toggle-status").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const userId = btn.dataset.id;
        const newStatus = btn.dataset.active !== "true";
        const result = await window.AdminManager.updateUserStatus(
          userId,
          newStatus
        );
        if (result.success) {
          this.loadUsers();
        }
      });
    });
  }

  async loadRecentActivities() {
    const activities = await window.AdminManager.getRecentActivities();
    const list = document.getElementById("recent-activities");
    if (!list) return;
    list.innerHTML = "";

    activities.forEach((activity) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <i class="fas fa-${activity.icon}"></i>
        <span>${activity.action}</span> - <strong>${activity.target}</strong>
        <small>${activity.time.toLocaleTimeString()}</small>
        <hr style="margin-bottom: 20px; margin-top: 20px;"> </hr>
      `;
      list.appendChild(li);
    });
  }

  attachEventListeners() {
    document
      .getElementById("logout-btn")
      ?.addEventListener("click", () => this.handleLogout());
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        if (section) {
          this.showSection(section);
        }
      });
    });
  }

  showSection(sectionName) {
    document.querySelectorAll(".content-section").forEach((section) => {
      section.classList.remove("active");
    });

    const target = document.getElementById(`${sectionName}-section`);
    if (target) target.classList.add("active");

    this.currentSection = sectionName;
    const pageTitle = document.getElementById("page-title");
    if (pageTitle) {
      const titles = {
        dashboard: "Admin Dashboard",
        events: "Manage Events",
        users: "Users Management",
        eventEdit: "Edit Event",
      };

      pageTitle.textContent = titles[sectionName] || "Admin Dashboard";
    }

    this.updateActiveNavItem();

    // Close sidebar on mobile when changing sections
    if (window.innerWidth <= 992 && this.sidebarActive) {
      const sidebar = document.getElementById("sidebar");
      const overlay = document.getElementById("sidebar-overlay");
      sidebar.classList.remove("active");
      if (overlay) overlay.classList.remove("active");
      document.body.classList.remove("sidebar-open");
      this.sidebarActive = false;
    }

    window.Logger.logUserAction("Admin section changed", {
      section: sectionName,
    });
  }

  updateActiveNavItem() {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.toggle(
        "active",
        item.dataset.section === this.currentSection
      );
    });
  }

  async handleLogout() {
    if (!confirm("Are you sure you want to logout?")) return;
    try {
      Utils.showLoading("Signing out...");
      const result = await window.AutManager.signOutUser();
      Utils.hideLoading();
      if (result.success) {
        Utils.showNotification(result.message, "success");
        setTimeout(() => (window.location.href = "index.html"), 1000);
      } else {
        Utils.showNotification(result.error, "error");
      }
    } catch (error) {
      Utils.hideLoading();
      Utils.showNotification("Error signing out", "error");
      window.Logger.logError("Admin logout error", { error: error.message });
    }
  }
}

let adminDashboard;
document.addEventListener("DOMContentLoaded", () => {
  adminDashboard = new AdminDashboard();
});
