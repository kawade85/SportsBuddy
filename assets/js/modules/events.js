// ==========================================================================
// Events Module - Sports Buddy Application
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
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db, COLLECTIONS, EVENT_STATUS } from "../firebase-config.js";

/**
 * Events management class
 */
class EventsManager {
  constructor() {
    this.events = [];
    this.userEvents = [];
    this.init();
  }

  /**
   * Initialize events manager
   */
  init() {
    window.Logger.logInfo("EventsManager initialized");
  }

  /**
   * Create a new event
   */
  async createEvent(eventData) {
    try {
      const currentUser = window.AutManager.getCurrentUser();

      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      window.Logger.logUserAction("Creating event", {
        title: eventData.title,
        sport: eventData.sport,
      });

      const eventDoc = {
        ...eventData,
        creatorId: currentUser.uid,
        creatorName: `${currentUser.firstName} ${currentUser.lastName}`,
        status: EVENT_STATUS.UPCOMING,
        participants: [currentUser.uid],
        participantCount: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.EVENTS), eventDoc);

      // Update user stats
      await this.updateUserEventStats(currentUser.uid, "eventsCreated", 1);

      window.Logger.logUserAction("Event created successfully", {
        eventId: docRef.id,
        title: eventData.title,
      });

      return {
        success: true,
        eventId: docRef.id,
        message: "Event created successfully!",
      };
    } catch (error) {
      window.Logger.logError("Failed to create event", {
        error: error.message,
      });

      return {
        success: false,
        error: "Failed to create event. Please try again.",
      };
    }
  }

  /**
   * Get user's events
   */
  async getUserEvents(userId) {
    try {
      console.log(
        "Querying with: creatorId =",
        userId,
        "orderBy createdAt DESC"
      );

      const q = query(
        collection(db, COLLECTIONS.EVENTS),
        where("creatorId", "==", userId),
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

      this.userEvents = events;

      window.Logger.logInfo("User events loaded", {
        userId,
        count: events.length,
      });

      return events;
    } catch (error) {
      window.Logger.logError("Failed to get user events", {
        userId,
        error: error.message,
      });
      return [];
    }
  }

  /**
   * Get all events with filters
   */
  async getEvents(filters = {}) {
    try {
      let q = collection(db, COLLECTIONS.EVENTS);

      // Apply filters
      const conditions = [where("isActive", "==", true)];

      if (filters.sport) {
        conditions.push(where("sport", "==", filters.sport));
      }

      if (filters.city) {
        conditions.push(where("city", "==", filters.city));
      }

      if (filters.skillLevel) {
        conditions.push(where("skillLevel", "==", filters.skillLevel));
      }

      if (filters.status) {
        conditions.push(where("status", "==", filters.status));
      }

      // Create query with conditions
      q = query(q, ...conditions, orderBy("createdAt", "desc"));

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      const events = [];

      querySnapshot.forEach((doc) => {
        events.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      this.events = events;

      window.Logger.logInfo("Events loaded with filters", {
        filters,
        count: events.length,
      });

      return events;
    } catch (error) {
      window.Logger.logError("Failed to get events", {
        filters,
        error: error.message,
      });
      return [];
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId) {
    try {
      const docRef = doc(db, COLLECTIONS.EVENTS, eventId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      } else {
        throw new Error("Event not found");
      }
    } catch (error) {
      window.Logger.logError("Failed to get event by ID", {
        eventId,
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Update event
   */
  async updateEvent(eventId, updates) {
    try {
      const currentUser = window.AutManager.getCurrentUser();

      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      // Check if user is the creator
      const event = await this.getEventById(eventId);
      if (
        !event ||
        (event.creatorId !== currentUser.uid && !window.AutManager.isAdmin())
      ) {
        throw new Error("Unauthorized to update this event");
      }

      const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(eventRef, updateData);

      window.Logger.logUserAction("Event updated", {
        eventId,
        updates: Object.keys(updates),
      });

      return {
        success: true,
        message: "Event updated successfully!",
      };
    } catch (error) {
      window.Logger.logError("Failed to update event", {
        eventId,
        error: error.message,
      });

      return {
        success: false,
        error: error.message || "Failed to update event. Please try again.",
      };
    }
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId) {
    try {
      const currentUser = window.AutManager.getCurrentUser();

      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      // Check if user is the creator or admin
      const event = await this.getEventById(eventId);
      if (!event) {
        throw new Error("Event not found");
      }

      if (event.creatorId !== currentUser.uid && !window.AutManager.isAdmin()) {
        throw new Error("Unauthorized to delete this event");
      }

      await deleteDoc(doc(db, COLLECTIONS.EVENTS, eventId));

      // Update user stats
      if (event.creatorId === currentUser.uid) {
        await this.updateUserEventStats(currentUser.uid, "eventsCreated", -1);
      }

      window.Logger.logUserAction("Event deleted", {
        eventId,
        title: event.title,
      });

      return {
        success: true,
        message: "Event deleted successfully!",
      };
    } catch (error) {
      window.Logger.logError("Failed to delete event", {
        eventId,
        error: error.message,
      });

      return {
        success: false,
        error: error.message || "Failed to delete event. Please try again.",
      };
    }
  }

  /**
   * Join event
   */
  async joinEvent(eventId) {
    try {
      const currentUser = window.AutManager.getCurrentUser();

      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      const event = await this.getEventById(eventId);
      if (!event) {
        throw new Error("Event not found");
      }

      // Check if user is already a participant
      if (event.participants && event.participants.includes(currentUser.uid)) {
        return {
          success: false,
          error: "You are already a participant in this event.",
        };
      }

      // Check if event is full
      if (event.participantCount >= event.maxParticipants) {
        return {
          success: false,
          error: "This event is full.",
        };
      }

      // Add user to participants
      const updatedParticipants = [
        ...(event.participants || []),
        currentUser.uid,
      ];

      await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), {
        participants: updatedParticipants,
        participantCount: updatedParticipants.length,
        updatedAt: serverTimestamp(),
      });

      // Update user stats
      await this.updateUserEventStats(currentUser.uid, "eventsJoined", 1);

      window.Logger.logUserAction("Joined event", {
        eventId,
        title: event.title,
      });

      return {
        success: true,
        message: "Successfully joined the event!",
      };
    } catch (error) {
      window.Logger.logError("Failed to join event", {
        eventId,
        error: error.message,
      });

      return {
        success: false,
        error: error.message || "Failed to join event. Please try again.",
      };
    }
  }

  /**
   * Leave event
   */
  async leaveEvent(eventId) {
    try {
      const currentUser = window.AutManager.getCurrentUser();

      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      const event = await this.getEventById(eventId);
      if (!event) {
        throw new Error("Event not found");
      }

      // Check if user is a participant
      if (
        !event.participants ||
        !event.participants.includes(currentUser.uid)
      ) {
        return {
          success: false,
          error: "You are not a participant in this event.",
        };
      }

      // Remove user from participants
      const updatedParticipants = event.participants.filter(
        (uid) => uid !== currentUser.uid
      );

      await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), {
        participants: updatedParticipants,
        participantCount: updatedParticipants.length,
        updatedAt: serverTimestamp(),
      });

      // Update user stats
      await this.updateUserEventStats(currentUser.uid, "eventsJoined", -1);

      window.Logger.logUserAction("Left event", {
        eventId,
        title: event.title,
      });

      return {
        success: true,
        message: "Successfully left the event.",
      };
    } catch (error) {
      window.Logger.logError("Failed to leave event", {
        eventId,
        error: error.message,
      });

      return {
        success: false,
        error: error.message || "Failed to leave event. Please try again.",
      };
    }
  }

  /**
   * Update user event statistics
   */
  async updateUserEventStats(userId, statType, increment) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentStats = userData.stats || {};
        const currentValue = currentStats[statType] || 0;

        await updateDoc(userRef, {
          [`stats.${statType}`]: Math.max(0, currentValue + increment),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      window.Logger.logError("Failed to update user stats", {
        userId,
        statType,
        increment,
        error: error.message,
      });
    }
  }

  /**
   * Get upcoming events for user
   */
  async getUpcomingEvents(userId, limit = 5) {
    try {
      const now = new Date();
      const q = query(
        collection(db, COLLECTIONS.EVENTS),
        where("participants", "array-contains", userId),
        where("status", "==", EVENT_STATUS.UPCOMING),
        orderBy("date", "asc"),
        limit(limit)
      );

      const querySnapshot = await getDocs(q);
      const events = [];

      querySnapshot.forEach((doc) => {
        const eventData = doc.data();
        const eventDate = new Date(eventData.date);

        if (eventDate >= now) {
          events.push({
            id: doc.id,
            ...eventData,
          });
        }
      });

      return events;
    } catch (error) {
      window.Logger.logError("Failed to get upcoming events", {
        userId,
        error: error.message,
      });
      return [];
    }
  }

  /**
   * Find matching events for user
   */
  async findMatchingEvents(userId, preferences = {}) {
    try {
      const user = await window.AutManager.getUserData(userId);

      let q = query(
        collection(db, COLLECTIONS.EVENTS),
        where("isActive", "==", true),
        where("status", "==", EVENT_STATUS.UPCOMING)
      );

      // Filter by user's city if no specific preferences
      if (!preferences.city && user.city) {
        q = query(q, where("city", "==", user.city));
      }

      const querySnapshot = await getDocs(q);
      const events = [];

      querySnapshot.forEach((doc) => {
        const eventData = doc.data();

        // Don't include user's own events
        if (eventData.creatorId !== userId) {
          // Don't include events user is already part of
          if (
            !eventData.participants ||
            !eventData.participants.includes(userId)
          ) {
            events.push({
              id: doc.id,
              ...eventData,
            });
          }
        }
      });

      // Sort by relevance (same area, skill level, etc.)
      const sortedEvents = events.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        // Same area bonus
        if (a.area === user.area) scoreA += 3;
        if (b.area === user.area) scoreB += 3;

        // Same city bonus (if not already filtered)
        if (a.city === user.city) scoreA += 2;
        if (b.city === user.city) scoreB += 2;

        return scoreB - scoreA;
      });

      return sortedEvents.slice(0, 10); // Return top 10 matches
    } catch (error) {
      window.Logger.logError("Failed to find matching events", {
        userId,
        error: error.message,
      });
      return [];
    }
  }

  /**
   * Get event statistics
   */
  async getEventStats() {
    try {
      const eventsSnapshot = await getDocs(collection(db, COLLECTIONS.EVENTS));

      const stats = {
        total: 0,
        upcoming: 0,
        completed: 0,
        cancelled: 0,
        byMonth: {},
        bySport: {},
        byCity: {},
      };

      eventsSnapshot.forEach((doc) => {
        const event = doc.data();
        stats.total++;

        // By status
        if (event.status) {
          stats[event.status] = (stats[event.status] || 0) + 1;
        }

        // By month
        if (event.createdAt && event.createdAt.toDate) {
          const month = event.createdAt
            .toDate()
            .toLocaleString("default", { month: "long", year: "numeric" });
          stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
        }

        // By sport
        if (event.sport) {
          stats.bySport[event.sport] = (stats.bySport[event.sport] || 0) + 1;
        }

        // By city
        if (event.city) {
          stats.byCity[event.city] = (stats.byCity[event.city] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      window.Logger.logError("Failed to get event stats", {
        error: error.message,
      });
      return null;
    }
  }
}

// Create global events manager instance
window.EventsManager = new EventsManager();

// Export for module use
export default EventsManager;
