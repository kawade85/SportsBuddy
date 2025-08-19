// ==========================================================================
// Firebase Configuration - Sports Buddy Application
// ==========================================================================

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {

  apiKey: "AIzaSyAoLcJAPG3Z34xwzF_y0k-p22KnUe0J0Ps",
    authDomain: "sportsbuddy-93d1f.firebaseapp.com",
    projectId: "sportsbuddy-93d1f",
    storageBucket: "sportsbuddy-93d1f.appspot.com",
    messagingSenderId: "727932722657",
    appId: "1:727932722657:web:6ac1299e709df7d5dd86a0",
    measurementId: "G-V39Q5KTN7K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export the app instance
export default app;

// Collection names (constants for consistency)
export const COLLECTIONS = {
  USERS: "users",
  EVENTS: "events",
};

// User roles
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
};

// Event status
export const EVENT_STATUS = {
  UPCOMING: "upcoming",
  ONGOING: "ongoing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// Skill levels
export const SKILL_LEVELS = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
  PROFESSIONAL: "professional",
};

// Log this configuration loading
console.log("Firebase configuration loaded successfully");



