// ==========================================================================
// Authentication Module - Sports Buddy Application
// ==========================================================================

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { auth, db, COLLECTIONS, USER_ROLES } from "../firebase-config.js";
// import Utils from "./utils.js"; // Declare the Utils variable

/**
 * Authentication class handling user registration, login, and session management
 */
class AutManager {
  constructor() {
    this.currentUser = null;
    this.authStateListeners = [];
    this.init();
  }

  /**
   * Initialize auth manager
   */
  init() {
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      this.handleAuthStateChange(user);
    });

    window.Logger.logAuth("AutManager initialized");
  }

  /**
   * Handle authentication state changes
   */
  async handleAuthStateChange(user) {
    try {
      if (user) {
        // User is signed in
        const userDoc = await this.getUserData(user.uid);
        this.currentUser = {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          ...userDoc,
        };

        // Save user to localStorage
        Utils.setLocalStorage("sports_buddy_user", this.currentUser);

        window.Logger.logAuth("User signed in", {
          uid: user.uid,
          email: user.email,
        });
      } else {
        // User is signed out
        this.currentUser = null;
        Utils.removeLocalStorage("sports_buddy_user");

        window.Logger.logAuth("User signed out");
      }

      // Notify listeners
      this.notifyAuthStateListeners(this.currentUser);
    } catch (error) {
      window.Logger.logError("Error in auth state change handler", {
        error: error.message,
      });
    }
  }

  /**
   * Register a new user
   */
  async registerUser(userData, role = USER_ROLES.USER) {
    try {
      console.log("🚀 Registering:", userData.email);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${userData.firstName} ${userData.lastName}`,
      });

      const userDoc = {
        uid: user.uid,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        city: userData.city,
        area: userData.area,
        role: role || USER_ROLES.USER,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profileComplete: true,
        isActive: true,
        preferences: {
          notifications: true,
          emailUpdates: true,
        },
        stats: {
          eventsCreated: 0,
          eventsJoined: 0,
          matchesFound: 0,
          rating: 0,
          totalRatings: 0,
        },
      };

      // 🔐 Firestore write
      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userDoc);
      console.log("✅ Firestore user doc written for UID:", user.uid);

      // 🧠 Now we know Firestore is ready; trigger auth state manually
      await this.handleAuthStateChange(user);

      return {
        success: true,
        user: user,
        message: "Registration successful!",
      };
    } catch (error) {
      window.Logger.logError("User registration failed", {
        error: error.message,
        code: error.code,
      });

      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code,
      };
    }
  }

  /**
   * Sign in user
   */
  async signInUser(email, password, userType) {
    try {
      window.Logger.logAuth("Attempting user sign in", {
        email,
        userType,
      });

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get user data from Firestore
      const userData = await this.getUserData(user.uid);

      console.log(
        `[DEBUG] Role from Firestore: "${userData.role}"`,
        typeof userData.role
      );
      console.log(
        `[DEBUG] User type from login: "${userType}"`,
        typeof userType
      );

      if (userType && userData.role?.trim() !== userType.trim()) {
        await this.signOutUser();
        return {
          success: false,
          error: `Access denied. You must be logged in as a ${userType}.`,
        };
      }

      // Update last login
      await this.updateLastLogin(user.uid);

      window.Logger.logAuth("User sign in successful", {
        uid: user.uid,
        email: user.email,
        role: userData.role,
      });

      this.redirectAfterAuth(userData);

      return {
        success: true,
        user: user,
        userData: userData,
        message: "Sign in successful!",
      };
    } catch (error) {
      window.Logger.logError("User sign in failed", {
        error: error.message,
        code: error.code,
      });

      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code,
      };
    }
  }

  /**
   * Sign out user
   */
  async signOutUser() {
    try {
      await signOut(auth);

      window.Logger.logAuth("User signed out successfully");

      return {
        success: true,
        message: "Signed out successfully!",
      };
    } catch (error) {
      window.Logger.logError("Sign out failed", {
        error: error.message,
      });

      return {
        success: false,
        error: "Failed to sign out. Please try again.",
      };
    }
  }

  /**
   * Get user data from Firestore
   */
  async getUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));

      console.log(db);

      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        throw new Error("User document not found");
      }
    } catch (error) {
      window.Logger.logError("Failed to get user data", {
        uid,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(uid) {
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      window.Logger.logError("Failed to update last login", {
        uid,
        error: error.message,
      });
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.currentUser;
  }

  /**
   * Check if user is admin
   */
  // isAdmin() {
  //   return this.currentUser?.role === USER_ROLES.ADMIN;
  // }

  isAdmin() {
    const currentUser = this.getCurrentUser();
    return (this.currentUser?.role || currentUser.role) === USER_ROLES.ADMIN;
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return Utils.getLocalStorage("sports_buddy_user");
  }

  /**
   * Add auth state listener
   */
  addAuthStateListener(callback) {
    this.authStateListeners.push(callback);
  }

  /**
   * Remove auth state listener
   */
  removeAuthStateListener(callback) {
    const index = this.authStateListeners.indexOf(callback);
    if (index > -1) {
      this.authStateListeners.splice(index, 1);
    }
  }

  /**
   * Notify auth state listeners
   */
  notifyAuthStateListeners(user) {
    this.authStateListeners.forEach((callback) => {
      try {
        callback(user);
      } catch (error) {
        window.Logger.logError("Error in auth state listener", {
          error: error.message,
        });
      }
    });
  }

  /**
   * Redirect based on user role
   */
  redirectAfterAuth(userData) {
    const isAdmin = userData.role === USER_ROLES.ADMIN;
    const targetPage = isAdmin ? "admin-dashboard.html" : "user-dashboard.html";

    window.Logger.logAuth("Redirecting after authentication", {
      role: userData.role,
      targetPage,
    });

    window.location.href = targetPage;
  }

  /**
   * Check authentication and redirect if needed
   */
  async requireAuth(requiredRole = null) {
    this.currentUser = await this.getCurrentUser("sports_buddy_user");

    console.log(this.currentUser, requiredRole);

    if (requiredRole == null) {
      window.Logger.logAuth("Authentication required, redirecting to login");
      window.location.href = "login.html";
      return false;
    }

    if (requiredRole && this.currentUser.role !== requiredRole) {
      window.Logger.logAuth("Insufficient privileges", {
        required: requiredRole,
        current: this.currentUser.role,
      });
      Utils.showNotification(
        "Access denied. Insufficient privileges.",
        "error"
      );
      window.location.href = "index.html";
      return false;
    }

    return true;
  }

  /**
   * Get user-friendly error messages
   */
  getAuthErrorMessage(errorCode) {
    const errorMessages = {
      "auth/email-already-in-use":
        "This email is already registered. Please use a different email or sign in.",
      "auth/weak-password":
        "Password is too weak. Please choose a stronger password.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/user-not-found": "No account found with this email address.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/invalid-credential":
        "Invalid email or password. Please check your credentials.",
      "auth/too-many-requests":
        "Too many failed attempts. Please try again later.",
      "auth/network-request-failed":
        "Network error. Please check your internet connection.",
      "auth/operation-not-allowed":
        "This operation is not allowed. Please contact support.",
      "auth/requires-recent-login":
        "Please sign in again to complete this action.",
    };

    return (
      errorMessages[errorCode] ||
      "An unexpected error occurred. Please try again."
    );
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates) {
    try {
      if (!this.currentUser) {
        throw new Error("No authenticated user");
      }

      const userRef = doc(db, COLLECTIONS.USERS, this.currentUser.uid);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(userRef, updateData);

      // Update local user data
      this.currentUser = { ...this.currentUser, ...updates };
      Utils.setLocalStorage("sports_buddy_user", this.currentUser);

      window.Logger.logAuth("User profile updated successfully", {
        uid: this.currentUser.uid,
        updates: Object.keys(updates),
      });

      return {
        success: true,
        message: "Profile updated successfully!",
      };
    } catch (error) {
      window.Logger.logError("Failed to update user profile", {
        error: error.message,
      });

      return {
        success: false,
        error: "Failed to update profile. Please try again.",
      };
    }
  }
}

// Create global auth manager instance
window.AutManager = new AutManager();

// Export for module use
export default AutManager;

console.log("auth loaded");
