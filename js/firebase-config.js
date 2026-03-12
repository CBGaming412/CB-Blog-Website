/* ══════════════════════════════════════════════
   Firebase Configuration
   ══════════════════════════════════════════════
   
   INSTRUCTIONS:
   1. Go to https://console.firebase.google.com
   2. Create a new project (or use an existing one)
   3. Enable Authentication → Sign-in method → Google
   4. Enable Cloud Firestore 
   5. Go to Project Settings → Your apps → Web app → Register
   6. Copy your config object and paste it below
   
   ══════════════════════════════════════════════ */

const firebaseConfig = {
    apiKey: "AIzaSyBKWskDc5XDVcTgSlfVoi6Me6CqCcVFgHE",
    authDomain: "carl1-byte2.firebaseapp.com",
    projectId: "carl1-byte2",
    storageBucket: "carl1-byte2.firebasestorage.app",
    messagingSenderId: "103472502292",
    appId: "1:103472502292:web:9c27f61e724ae63b27b901",
    measurementId: "G-9PCWCN38PM"
};

// ─── Initialize Firebase ───
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// ─── Admin email — change this to YOUR Gmail address ───
// The first user who signs in with this email gets admin privileges
const ADMIN_EMAIL = "carlbrynembaluyot08@gmail.com";

console.log("🔥 Firebase initialized");
