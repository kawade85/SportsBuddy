// ==========================================================================
// Logger Module - Sports Buddy Application
// ==========================================================================

/**
 * Logger utility for tracking user actions and system events
 * Provides different log levels and persistent logging capabilities
 */
class Logger {
  constructor() {
    this.logLevel = "INFO"
    this.logs = []
    this.maxLogs = 1000
    this.storageKey = "sports_buddy_logs"
    this.init()
  }

  /**
   * Initialize the logger
   */
  init() {
    this.loadLogsFromStorage()
    this.logInfo("Logger initialized", { timestamp: new Date().toISOString() })
  }

  /**
   * Set the logging level
   * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR)
   */
  setLogLevel(level) {
    this.logLevel = level.toUpperCase()
    this.logInfo(`Log level set to: ${this.logLevel}`)
  }

  /**
   * Create a log entry
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   * @param {string} category - Log category
   */
  createLogEntry(level, message, data = {}, category = "GENERAL") {
    const logEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      category: category.toUpperCase(),
      message,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
    }

    return logEntry
  }

  /**
   * Log debug message
   */
  logDebug(message, data = {}, category = "DEBUG") {
    if (this.shouldLog("DEBUG")) {
      const logEntry = this.createLogEntry("DEBUG", message, data, category)
      this.addLog(logEntry)
      console.debug(`[DEBUG] ${message}`, data)
    }
  }

  /**
   * Log info message
   */
  logInfo(message, data = {}, category = "INFO") {
    if (this.shouldLog("INFO")) {
      const logEntry = this.createLogEntry("INFO", message, data, category)
      this.addLog(logEntry)
      console.info(`[INFO] ${message}`, data)
    }
  }

  /**
   * Log warning message
   */
  logWarn(message, data = {}, category = "WARNING") {
    if (this.shouldLog("WARN")) {
      const logEntry = this.createLogEntry("WARN", message, data, category)
      this.addLog(logEntry)
      console.warn(`[WARN] ${message}`, data)
    }
  }

  /**
   * Log error message
   */
  logError(message, data = {}, category = "ERROR") {
    if (this.shouldLog("ERROR")) {
      const logEntry = this.createLogEntry("ERROR", message, data, category)
      this.addLog(logEntry)
      console.error(`[ERROR] ${message}`, data)
    }
  }

  /**
   * Log user action
   */
  logUserAction(action, data = {}) {
    this.logInfo(`User action: ${action}`, data, "USER_ACTION")
  }

  /**
   * Log authentication events
   */
  logAuth(action, data = {}) {
    this.logInfo(`Auth: ${action}`, data, "AUTHENTICATION")
  }

  /**
   * Log API calls
   */
  logAPI(method, endpoint, data = {}) {
    this.logInfo(`API Call: ${method} ${endpoint}`, data, "API")
  }

  /**
   * Log performance metrics
   */
  logPerformance(metric, value, data = {}) {
    this.logInfo(`Performance: ${metric}`, { value, ...data }, "PERFORMANCE")
  }

  /**
   * Check if should log based on level
   */
  shouldLog(level) {
    const levels = ["DEBUG", "INFO", "WARN", "ERROR"]
    const currentLevelIndex = levels.indexOf(this.logLevel)
    const messageLevelIndex = levels.indexOf(level)
    return messageLevelIndex >= currentLevelIndex
  }

  /**
   * Add log to memory and storage
   */
  addLog(logEntry) {
    this.logs.unshift(logEntry)

    // Keep only max logs in memory
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    this.saveLogsToStorage()
  }

  /**
   * Generate unique log ID
   */
  generateLogId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  /**
   * Get current user ID if available
   */
  getCurrentUserId() {
    try {
      const user = JSON.parse(localStorage.getItem("sports_buddy_user"))
      return user?.uid || "anonymous"
    } catch {
      return "anonymous"
    }
  }

  /**
   * Save logs to localStorage
   */
  saveLogsToStorage() {
    try {
      const logsToSave = this.logs.slice(0, 100) // Save only last 100 logs
      localStorage.setItem(this.storageKey, JSON.stringify(logsToSave))
    } catch (error) {
      console.error("Failed to save logs to storage:", error)
    }
  }

  /**
   * Load logs from localStorage
   */
  loadLogsFromStorage() {
    try {
      const savedLogs = localStorage.getItem(this.storageKey)
      if (savedLogs) {
        this.logs = JSON.parse(savedLogs)
      }
    } catch (error) {
      console.error("Failed to load logs from storage:", error)
      this.logs = []
    }
  }

  /**
   * Get all logs
   */
  getAllLogs() {
    return [...this.logs]
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level) {
    return this.logs.filter((log) => log.level === level.toUpperCase())
  }

  /**
   * Get logs by category
   */
  getLogsByCategory(category) {
    return this.logs.filter((log) => log.category === category.toUpperCase())
  }

  /**
   * Get logs by date range
   */
  getLogsByDateRange(startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)

    return this.logs.filter((log) => {
      const logDate = new Date(log.timestamp)
      return logDate >= start && logDate <= end
    })
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = []
    localStorage.removeItem(this.storageKey)
    this.logInfo("All logs cleared")
  }

  /**
   * Export logs as JSON
   */
  exportLogs() {
    const exportData = {
      exported_at: new Date().toISOString(),
      total_logs: this.logs.length,
      logs: this.logs,
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Send logs to server (if implemented)
   */
  async sendLogsToServer() {
    try {
      this.logInfo("Attempting to send logs to server")
      // Implementation would depend on your backend
      // This is a placeholder for the functionality

      const logsToSend = this.logs.filter((log) => !log.sent)

      if (logsToSend.length === 0) {
        this.logInfo("No new logs to send")
        return
      }

      // Mock API call - replace with actual endpoint
      /*
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: logsToSend })
      });

      if (response.ok) {
        // Mark logs as sent
        logsToSend.forEach(log => log.sent = true);
        this.saveLogsToStorage();
        this.logInfo(`Successfully sent ${logsToSend.length} logs to server`);
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      */

      this.logInfo("Log sending to server not implemented yet")
    } catch (error) {
      this.logError("Failed to send logs to server", { error: error.message })
    }
  }
}

// Create global logger instance
window.Logger = new Logger()

// Export for module use
if (typeof module !== "undefined" && module.exports) {
  module.exports = Logger
}

// Auto-log page load
window.Logger.logInfo("Page loaded", {
  page: window.location.pathname,
  title: document.title,
  loadTime: performance.now(),
})

// Log unhandled errors
window.addEventListener("error", (event) => {
  window.Logger.logError("Unhandled JavaScript error", {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
  })
})

// Log unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  window.Logger.logError("Unhandled promise rejection", {
    reason: event.reason,
    stack: event.reason?.stack,
  })
})
