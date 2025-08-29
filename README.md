     Web Development Project Report
Project Title: Sports Buddy - Find Your Perfect Sports Partner

Developer: Mayuri Kawade

Duration: June 2025 – August 2025

1. Introduction
Sports Buddy is a web application that helps users discover sports partners and local events. It provides user registration and authentication, a personalized dashboard to create or join events, and an admin dashboard to monitor activity. The project is implemented as a client-side app using HTML, CSS, and JavaScript, with Firebase services for authentication and data storage.

The user of the Sports Buddy application will upload details on various sports information, locations, and times that are held near the user's location. Sports Buddy is the world's largest sports matching site, with millions of pairings. Sports Buddy, which is powered by cutting-edge Android technology, allows you to grow your network, make new acquaintances, meet locals while traveling, and locate your buddy in over N sports. Creating an app that helps users to form genuine, meaningful interactions outside of their social circles. Connecting on Sports Buddy is simple and enjoyable; simply choose the sports you're interested in, establish your ability level, and start matching !

2. Objectives
* Enable users to register/login securely and manage their profiles.
* Allow users to create, browse, and join sports events based on location and sport.
* Provide an admin module to oversee users, events, and reports/logs.
* Deliver a responsive, accessible, and engaging UI across devices.
* Ensure data integrity and security through Firebase Authentication and rules.

  
3. Tools & Technologies Used
* Frontend: HTML5, CSS3, JavaScript (ES6 modules)
* Styling: Custom CSS (Flexbox, Grid, media queries, utility classes)
* Backend as a Service: Firebase (Authentication, Firestore/Realtime DB)
* Build/Runtime: Node.js & npm (scripts, dependency management)
* Version Control & Hosting: GitHub (source), Netlify/Firebase Hosting (deployment)
* Developer Tools: VS Code, Browser DevTools

  
4. System Architecture
The application follows a modular client-side architecture. UI is rendered with HTML templates and styled with CSS. JavaScript modules encapsulate authentication, event management, utilities, and admin logic. Firebase provides identity, persistence, and security rules. The app can be deployed to static hosting.

4.1 Project Structure (Key Files)

HTML Pages:
*  sportsGuide/admin-dashboard.html
* sportsGuide/index.html
* sportsGuide/login.html
* sportsGuide/register.html
* sportsGuide/user-dashboard.html

Stylesheets:
*  sportsGuide/assets/css/admin.css
* sportsGuide/assets/css/auth.css
*  sportsGuide/assets/css/dashboard.css
*  sportsGuide/assets/css/home.css
*  sportsGuide/assets/css/main.css

JavaScript:
* • sportsGuide/assets/js/admin-dashboard.js
* • sportsGuide/assets/js/firebase-config.js (Firebase-related)
* • sportsGuide/assets/js/home.js
* • sportsGuide/assets/js/login.js
* • sportsGuide/assets/js/register.js
* • sportsGuide/assets/js/user-dashboard.js
* • sportsGuide/assets/js/modules/admin.js (Firebase-related)
* • sportsGuide/assets/js/modules/auth.js (Firebase-related)
* • sportsGuide/assets/js/modules/events.js (Firebase-related)
* • sportsGuide/assets/js/modules/logger.js
* • sportsGuide/assets/js/modules/utils.js


4.2 Core Modules & Responsibilities
• modules/auth.js: Handles sign-up, sign-in, sign-out, session state, and guards.
• modules/events.js: CRUD for events, filtering by sport/location, join/leave logic.
• modules/admin.js: Admin-only operations (list users/events, moderation, stats).
• modules/utils.js: Helpers (DOM utilities, validators, formatters).
• modules/logger.js: Client-side logging/auditing for key actions.
• firebase-config.js: Firebase initialization and exported instances.


4.3 Data Design (Indicative)
Collections (Firestore) / Paths (Realtime DB):
• users: uid, name, email, city, sports[], createdAt, role ('user'|'admin').
• events: id, title, sport, city, venue, dateTime, hostUid, capacity, participants[], createdAt.
• logs (optional): timestamp, uid, action, payload.
Security: Firebase rules restrict read/write per authenticated user and role.


5. Key Features
* Account Management: Register, login, logout, view/update profile.
* Event Management: Create, browse, filter, and join/leave sports events.
* Search & Filters: By sport, city/area, date/time, and availability.
* Admin Dashboard: Manage users/events, view metrics and logs.
* Responsive Layout: Mobile-first styles with adaptive grids/flex.
* Client-Side Logging: Track notable actions for diagnostics.


6. UI/UX Overview
• index.html: Landing page with hero, feature highlights, and call-to-action.
• register.html & login.html: Accessible forms with validations and feedback.
• user-dashboard.html: Cards/tables showing upcoming events and quick actions.
• admin-dashboard.html: Admin-only navigation, lists, and moderation tools.


7. Challenges & Solutions
• Challenge: Securing user data and preventing unauthorized access.
  - Solution: Firebase Authentication with role checks in code and database security rules.

• Challenge: Maintaining responsive usability on small screens.
  - Solution: Mobile-first CSS, fluid grids, and touch-friendly controls.

• Challenge: Handling event concurrency (capacity/joins).
  - Solution: Atomic updates/transactions and validation on the client with server rules.

• Challenge: Organizing growing JS codebase.
  - Solution: ES6 modules for auth, events, admin, utils, and centralized config.



9. Testing & Quality

    
* Unit-like tests for utilities and validators (manual/console-based).
* Auth flow testing: sign-up, sign-in, error states, route guards.
* Event scenarios: create/join/leave, capacity edges, filtering.
* Role checks: ensure admin features are inaccessible to regular users.
* Responsive testing on Chrome DevTools (mobile/tablet/desktop viewports).

  
10. Deployment & How to Run
Local: Serve over a local HTTP server (e.g., Live Server). Configure Firebase keys in assets/js/firebase-config.js. Ensure authorized domains include localhost and your host.
Hosting: Deploy static files to Netlify/Vercel/Firebase Hosting. Set environment variables or secure config for Firebase on the host and restrict API keys with domain and rules.


11. Conclusion
Sports Buddy achieves its goal of connecting players by sport and location, with a clean user flow, secure sign-in, and modular client architecture. Firebase integration keeps the stack lightweight while providing production-grade identity and storage. The codebase is organized for maintainability and future growth.


12. Future Enhancements
* Chat or messaging between event participants.
* Calendar sync and reminders (Google/Apple Calendar).
* Geo-based suggestions using Maps APIs and distance filters.
* Ratings/reviews for hosts and players; reputation system.
* Offline support and caching with a Service Worker (PWA).
* Automated tests (Jest + Playwright) and CI/CD pipeline.


Appendix A: File Index
HTML Pages
*  sportsGuide/admin-dashboard.html
*  sportsGuide/index.html
*  sportsGuide/login.html
*  sportsGuide/register.html
*  sportsGuide/user-dashboard.html
CSS Files
*  sportsGuide/assets/css/admin.css
*  sportsGuide/assets/css/auth.css
*  sportsGuide/assets/css/dashboard.css
*  sportsGuide/assets/css/home.css
*  sportsGuide/assets/css/main.css
JavaScript Files
*  sportsGuide/assets/js/admin-dashboard.js
*  sportsGuide/assets/js/firebase-config.js
*  sportsGuide/assets/js/home.js
*  sportsGuide/assets/js/login.js
*  sportsGuide/assets/js/register.js
*  sportsGuide/assets/js/user-dashboard.js
*  sportsGuide/assets/js/modules/admin.js
*  sportsGuide/assets/js/modules/auth.js
*  sportsGuide/assets/js/modules/events.js
*  sportsGuide/assets/js/modules/logger.js
*  sportsGuide/assets/js/modules/utils.js


13. Project Links
The project is hosted live on Netlify for demonstration and the complete source code is available on GitHub.

* Live Project (Netlify): https://sportsmbuddy.netlify.app/ 
* Source Code (GitHub): https://github.com/kawade85/SportsBuddy 


