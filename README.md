# CB Blog Website

A sleek, modern, fully functional blog website powered by vanilla HTML/CSS/JavaScript and Firebase. It features a dark-mode-first premium design, an integrated admin dashboard for writing posts, and a user feedback system where authenticated users can leave ratings and comments on articles.

## ✨ Features

- **Premium UI/UX Design**
  - Stunning dark-mode aesthetics with vibrant gradients and glassmorphism.
  - Smooth micro-interactions, hover effects, and page transition animations.
  - Fully responsive mobile-first layout with a collapsible hamburger navigation.

- **Authentication System**
  - Seamless "Sign in with Google" integration via Firebase Auth.
  - Role-based access control protecting the dashboard (only the predefined Admin email can access post creation).

- **Admin Dashboard (CRUD)**
  - A secure dashboard gateway for writing, editing, and managing blog posts.
  - Rich form inputs including dynamic category selection.
  - Real-time updates pushed directly to the Firestore database.
  - Ability to delete posts completely.

- **Dynamic Blog Feed**
  - Real-time fetching and rendering of published blog posts from Firestore.
  - Clean card-based grid layout displaying title, excerpt, metadata, and category tags.
  - Instant live search/filtering by post title or content.

- **Interactive Article View & Feedback**
  - Dedicated full-page view for each generated post supporting basic markdown-like formatting (headings, quotes, lists).
  - Integrated real-time comment and 5-star rating system.
  - Authenticated users can leave their thoughts, while unauthenticated users are seamlessly prompted to log in.

- **SPA Routing Architecture**
  - Custom, lightweight hash-based router built entirely in Vanilla JS.
  - No bloated frameworks: instantly switches views between the Home feed, individual articles, and the Admin dashboard without reloading the page.

## 🛠️ Technology Stack

- **Frontend Core:** HTML5, CSS3, ES6+ Vanilla JavaScript.
- **Styling:** Custom Vanilla CSS Grid/Flexbox design system (No Tailwind or Bootstrap).
- **Backend Services (Firebase):**
  - **Firebase Authentication** (Google sign-in provider).
  - **Cloud Firestore** (NoSQL realtime database for posts and feedback sub-collections).
  - **Firebase Hosting** (Deployed live).

## 🗂️ Project Structure

```text
CB Blog Website/
├── index.html              # Main SPA HTML shell
├── firebase.json           # Firebase Hosting configuration
├── firestore.rules         # Security rules securing writes and reads
├── css/
│   └── style.css           # 600+ lines of custom design system & tokens
└── js/
    ├── app.js              # Entry point & Toast notification utility
    ├── firebase-config.js  # Firebase configuration and admin definition
    ├── auth.js             # Controls Google Auth popup and UI state
    ├── router.js           # Handles #hash routing logic for the SPA
    ├── blog.js             # Logic for fetching, searching, and rendering posts
    ├── admin.js            # Dashboard logic (Save/Edit/Delete posts)
    └── feedback.js         # Interactive star-rating and comment logic
```

## 🚀 Setup & Installation

If you want to clone this project to run locally:

1. **Clone the repository** (or download the files).
2. **Launch a local server**. Because the project uses ES6 Modules and Firebase, it must be run over HTTP, not `file://`.
   ```bash
   npx http-server . -p 8080 -c-1
   ```
3. Open `http://localhost:8080` in your browser.

*(Note: The Firebase configuration in `js/firebase-config.js` is already wired up to the production Firebase project).*

## 📸 Screenshots

![screenshots/Screenshot 2026-03-12 165139.png]
*Description of screenshot 1*

![Screenshot 2 Placeholder](path/to/your/screenshot2.png)
*Description of screenshot 2*

