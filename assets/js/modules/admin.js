// ==========================================================================
// Admin Module - Sports Buddy Application (Simplified)
// ==========================================================================
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db, COLLECTIONS } from "../firebase-config.js";

class AdminManager {
  constructor() {
    this.users = [];
    this.init();
  }

  init() {
    window.Logger.logInfo("AdminManager initialized");
  }

  // ==========================================================================
  // Dashboard Statistics
  // ==========================================================================

  async getDashboardStats() {
    try {
      const stats = {
        users: 0,
        events: 0,
      };

      const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
      stats.users = usersSnapshot.size;

      const eventsSnapshot = await getDocs(collection(db, COLLECTIONS.EVENTS));
      stats.events = eventsSnapshot.size;

      window.Logger.logInfo("Dashboard stats loaded", stats);
      return stats;
    } catch (error) {
      window.Logger.logError("Failed to get dashboard stats", {
        error: error.message,
      });
      return {
        users: 0,
        events: 0,
      };
    }
  }

  // ==========================================================================
  // Users Management
  // ==========================================================================

  async getUsers() {
    try {
      const q = query(
        collection(db, COLLECTIONS.USERS),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const users = [];

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          ...userData,
          password: undefined,
        });
      });

      this.users = users;

      window.Logger.logInfo("Users loaded", { count: users.length });
      return users;
    } catch (error) {
      window.Logger.logError("Failed to get users", { error: error.message });
      return [];
    }
  }

  async updateUserStatus(userId, isActive) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(userRef, {
        isActive,
        updatedAt: serverTimestamp(),
      });

      window.Logger.logUserAction("User status updated", {
        userId,
        isActive,
      });

      return {
        success: true,
        message: `User ${isActive ? "activated" : "deactivated"} successfully!`,
      };
    } catch (error) {
      window.Logger.logError("Failed to update user status", {
        userId,
        error: error.message,
      });
      return {
        success: false,
        error: "Failed to update user status. Please try again.",
      };
    }
  }

  // ==========================================================================
  // Events Management (Stub: add more as needed)
  // ==========================================================================

  async getEvents() {
    try {
      const q = query(
        collection(db, COLLECTIONS.EVENTS),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const events = [];

      querySnapshot.forEach((doc) => {
        events.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      window.Logger.logInfo("Events loaded", { count: events.length });
      return events;
    } catch (error) {
      window.Logger.logError("Failed to get events", { error: error.message });
      return [];
    }
  }

  // ==========================================================================
  // Recent Activities (Mock for now)
  // ==========================================================================

  async getRecentActivities(limitCount = 10) {
    try {
      const activities = [
        {
          id: 1,
          action: "User Registration",
          target: "john.doe@example.com",
          time: new Date(Date.now() - 1000 * 60 * 5),
          icon: "user-plus",
        },
        {
          id: 2,
          action: "Event Created",
          target: "Football Match",
          time: new Date(Date.now() - 1000 * 60 * 15),
          icon: "calendar-plus",
        },
        {
          id: 3,
          action: "User Deactivated",
          target: "alice@example.com",
          time: new Date(Date.now() - 1000 * 60 * 30),
          icon: "user-slash",
        },
      ];

      return activities.slice(0, limitCount);
    } catch (error) {
      window.Logger.logError("Failed to get recent activities", {
        error: error.message,
      });
      return [];
    }
  }
}

// Global instance
window.AdminManager = new AdminManager();
export default AdminManager;
