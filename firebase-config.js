// ===== SHARED SERVER SETTINGS =====
// These tell the app which Firebase database to use, so every phone in the
// crew sees the same pub, timer and hall of shame.
//
// Until you paste your settings in, firebaseConfig stays null and the app
// works on each phone by itself, like before.
//
// Your Firebase settings are NOT a password: they're meant to sit in web
// pages. What keeps the data safe is the database "rules" in Firebase.

// Firebase project "12-pubs" (pubs-de756), database in Belgium.
// To go back to one-phone mode, replace the whole { ... } with null.
export const firebaseConfig = {
  apiKey: "AIzaSyDKxRBPvAe8S9VrEjiIeQcc_7V_OYmgFio",
  authDomain: "pubs-de756.firebaseapp.com",
  databaseURL: "https://pubs-de756-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pubs-de756",
  storageBucket: "pubs-de756.firebasestorage.app",
  messagingSenderId: "372345208667",
  appId: "1:372345208667:web:d027f7d267bafbc306a47e",
};

// Like a room code. Every phone using the same ROOM shares one crawl.
// Change it each year (e.g. "xmas-2027") to start a fresh night while
// keeping last year's results in the database.
export const ROOM = "xmas-2026";
