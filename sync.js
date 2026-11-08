// ===== SHARING WITH THE CREW (Firebase) =====
// This file connects the app to a free online database (Firebase Realtime
// Database), so every phone sees the same pub, rule, timer and hall of shame.
// One person taps "Next pub" and everyone's phone moves on.
//
// It's loaded with <script type="module">, which lets it "import" code from
// other files. Modules always run AFTER normal scripts, so by the time this
// runs, app.js has finished and window.app is ready for us to use.
//
// How the two files talk to each other:
//   app.js  -> window.sync.saveProgress(...)  "I changed something, share it"
//   sync.js -> window.app.applyProgress(...)  "Someone changed something, show it"

import { firebaseConfig, ROOM } from "./firebase-config.js";

// Firebase's own code, loaded straight from Google. The version number is
// pinned so an update on their side can't suddenly break the app.
const FIREBASE = "https://www.gstatic.com/firebasejs/10.12.2/";

if (!firebaseConfig) {
  // No settings yet: stay as a one-phone app
  window.app.setStatus("local");
} else {
  connect();
}

// "async" means this function can "await": pause until something arrives
// from the internet, without freezing the page.
async function connect() {
  window.app.setStatus("connecting");

  let fb, db;
  try {
    fb = await import(FIREBASE + "firebase-app.js");
    db = await import(FIREBASE + "firebase-database.js");
  } catch (error) {
    // No signal when the page opened. The app keeps working on this phone.
    console.error("Couldn't load Firebase:", error);
    window.app.setStatus("offline");
    return;
  }

  const firebaseApp = fb.initializeApp(firebaseConfig);
  const database = db.getDatabase(firebaseApp);

  // The database is like one big set of folders. Our crawl lives at
  //   crawls/xmas-2026/progress  -> which pub, rule flipped?, timer start
  //   crawls/xmas-2026/log       -> every punishment, one entry each
  const progressRef = db.ref(database, "crawls/" + ROOM + "/progress");
  const logRef = db.ref(database, "crawls/" + ROOM + "/log");

  // ----- Sending changes -----
  // Once window.sync exists, app.js starts sending its changes here.
  window.sync = {
    saveProgress: function (progress) {
      db.set(progressRef, progress);
    },
    // push() gives each punishment its own unique id, so two people
    // spinning at the same moment can't overwrite each other
    addPunishment: function (entry) {
      db.push(logRef, entry);
    },
    removePunishment: function (id) {
      db.remove(db.child(logRef, id));
    },
    clearLog: function () {
      db.remove(logRef);
    },
  };

  // ----- Receiving changes -----
  // onValue runs our function once straight away with what's in the
  // database, then again every time anything changes, from any phone.
  db.onValue(progressRef, function (snapshot) {
    // Empty database (first ever use)? Start at pub 1.
    window.app.applyProgress(snapshot.val() || {});
  });

  db.onValue(logRef, function (snapshot) {
    const entries = [];
    // Each child is one punishment. Its key is the unique id from push(),
    // and those ids sort oldest-first, so the log stays in order.
    snapshot.forEach(function (child) {
      const entry = child.val();
      entry.id = child.key;
      entries.push(entry);
      // (Careful: returning true here would stop the loop early.)
    });
    window.app.applyLog(entries);
  });

  // ".info/connected" is a special spot Firebase keeps updated: true while
  // this phone can reach the server, false when the signal drops.
  // Changes made while offline are saved and sent when it reconnects.
  db.onValue(db.ref(database, ".info/connected"), function (snapshot) {
    window.app.setStatus(snapshot.val() ? "live" : "offline");
  });
}
