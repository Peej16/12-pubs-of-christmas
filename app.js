// ===== THE ROUTE =====
// Each pub is now an "object": a bundle of facts inside { curly brackets }.
//   name      - what shows on screen
//   rule      - the pre-set rule, revealed when you arrive
//   mapSearch - what we type into Google Maps to find it
// To change the route or the rules for 2026, just edit this list.
const pubs = [
  { name: "Kennedys",        rule: "No names or nicknames",                                      mapSearch: "Kennedys pub, Westland Row, Dublin" },
  { name: "Lincoln's Inn",   rule: "T-Rex arms",                                                 mapSearch: "Lincoln's Inn pub, Lincoln Place, Dublin" },
  { name: "Tapped",          rule: "Accent pub",                                                 mapSearch: "Tapped bar, Dublin" },
  { name: "Kehoes",          rule: "Can't put your pint down. Last into the next pub downs their drink", mapSearch: "Kehoes pub, South Anne Street, Dublin" },
  { name: "Nearys",          rule: "Your partner buys your pint and feeds it to you",            mapSearch: "Nearys pub, Chatham Street, Dublin" },
  { name: "Sheehan's",       rule: "Swap shoes with your partner at the bottom of Grafton St. Last there takes a shot", mapSearch: "Sheehan's pub, Chatham Street, Dublin" },
  { name: "The Hairy Lemon", rule: "No swearing",                                                mapSearch: "The Hairy Lemon, Stephen Street Lower, Dublin" },
  { name: "Drury Buildings", rule: "Cocktails only",                                             mapSearch: "Drury Buildings, Drury Street, Dublin" },
  { name: "Grogans",         rule: "Have-to-say-yes pub",                                        mapSearch: "Grogans pub, South William Street, Dublin" },
  { name: "The Old Stand",   rule: "No phones",                                                  mapSearch: "The Old Stand pub, Exchequer Street, Dublin" },
  { name: "Bankers",         rule: "Can't use your hands",                                       mapSearch: "The Bankers bar, Trinity Street, Dublin" },
  { name: "Stag's Head",     rule: "No rules! 🎉",                                               mapSearch: "The Stag's Head, Dame Court, Dublin" },
];

// ===== PUNISHMENTS FOR THE WHEEL =====
//   label  - short text that fits on the wheel
//   detail - the full explanation shown after the spin
//   weight - how likely it is. Bigger number = bigger slice = more likely.
//            (Leave it out and it counts as 1.)
// Add or remove as many as you like: the wheel redraws itself to fit.
const punishments = [
  { label: "Down your pint 🍺", detail: "Down your pint!",                  weight: 4 },
  { label: "Buy them a pint 🍻", detail: "Buy a pint for whoever caught you", weight: 1 },
  { label: "Shot 🥃",           detail: "Take a shot!",                      weight: 1 },
  { label: "Stranger selfie 🤳", detail: "Get a selfie with a stranger",      weight: 1 },
  { label: "Scot free 🎁",      detail: "Scot free! No punishment this time", weight: 1, noPenalty: true },
];

// ===== THE CREW =====
//   name     - shown everywhere
//   nickname - shown on their card and the result pop-up
//   photo    - file name of their picture in the "photos" folder, e.g. "dave.jpg".
//              Leave it as "" and their initials show instead.
// Swap these placeholders for your actual group.
// Photo file names are already filled in: just save each person's picture
// into the photos folder with that exact name. Until then, initials show.
const people = [
  { name: "PJ",            nickname: "", photo: "pj.jpg" },
  { name: "Sean C",        nickname: "", photo: "sean.jpg" },
  { name: "Charlie Nevin", nickname: "", photo: "charlie.jpg" },
  { name: "Cian O D",      nickname: "", photo: "cian.jpg" },
  { name: "Conor Doyle",   nickname: "", photo: "conor-doyle.jpg" },
  { name: "Evan O Keeffe", nickname: "", photo: "evan.jpg" },
  { name: "Jack F",        nickname: "", photo: "jack.jpg" },
  { name: "Max McKeever",  nickname: "", photo: "max.jpg" },
  { name: "Michael Barry", nickname: "", photo: "michael.jpg" },
  { name: "Timmy Murphy",  nickname: "", photo: "timmy.jpg" },
  { name: "Devin",         nickname: "", photo: "devin.jpg" },
];

// How long each pub lasts on the timer
const PUB_MINUTES = 30;

// How long the wheel spins, in milliseconds (5000 = 5 seconds)
const SPIN_MS = 5000;

// ===== MAP LINKS =====
// encodeURIComponent turns spaces and apostrophes into a form that's safe
// to put in a web address.

// Opens a pub in the full Google Maps site / app
function mapLink(pub) {
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(pub.mapSearch);
}

// Opens walking directions between two pubs in the full Google Maps site / app
function directionsLink(fromPub, toPub) {
  return "https://www.google.com/maps/dir/?api=1&travelmode=walking" +
    "&origin=" + encodeURIComponent(fromPub.mapSearch) +
    "&destination=" + encodeURIComponent(toPub.mapSearch);
}

// The same two things, but in a form that can sit INSIDE our page (an
// "embed"). "output=embed" is what asks Google for the embeddable version.
function embedPlaceUrl(pub) {
  return "https://maps.google.com/maps?q=" + encodeURIComponent(pub.mapSearch) + "&output=embed";
}

function embedWalkUrl(fromPub, toPub) {
  return "https://maps.google.com/maps?saddr=" + encodeURIComponent(fromPub.mapSearch) +
    "&daddr=" + encodeURIComponent(toPub.mapSearch) +
    "&dirflg=w" +   // w = walking
    "&output=embed";
}

// ===== SAVED PROGRESS =====
// currentIndex: which pub we're in (0 = first, 12 = finished).
// ruleRevealed: has the card been flipped at the current pub yet?
// timerStart:   the moment the timer started (in milliseconds), or null if
//               it hasn't started. Saving the START time, not the time left,
//               means the timer stays right even if the phone locks or the
//               page is refreshed.
let currentIndex = Number(localStorage.getItem("currentIndex")) || 0;
let ruleRevealed = localStorage.getItem("ruleRevealed") === "yes";
let timerStart = Number(localStorage.getItem("timerStart")) || null;

// Save on this phone AND share with the crew (if the shared server is on)
function saveProgress() {
  saveLocally();
  // window.sync only exists once sync.js has connected to Firebase
  if (window.sync) {
    window.sync.saveProgress({
      currentIndex: currentIndex,
      ruleRevealed: ruleRevealed,
      timerStart: timerStart,
    });
  }
}

// Save on this phone only, so a refresh (or no signal) keeps your place
function saveLocally() {
  localStorage.setItem("currentIndex", currentIndex);
  localStorage.setItem("ruleRevealed", ruleRevealed ? "yes" : "no");
  if (timerStart) {
    localStorage.setItem("timerStart", timerStart);
  } else {
    localStorage.removeItem("timerStart");
  }
}

// ===== FIND THE HTML ELEMENTS WE NEED =====
const progressText = document.getElementById("progress-text");
const progressFill = document.getElementById("progress-fill");
const currentLabel = document.getElementById("current-label");
const currentPub = document.getElementById("current-pub");
const timerBox = document.getElementById("timer-box");
const timerDisplay = document.getElementById("timer-display");
const timerMessage = document.getElementById("timer-message");
const timerButton = document.getElementById("timer-button");
const ruleCard = document.getElementById("rule-card");
const ruleText = document.getElementById("rule-text");
const mapButton = document.getElementById("map-button");
const wheel = document.getElementById("wheel");
const spinButton = document.getElementById("spin-button");
const spinResult = document.getElementById("spin-result");
const pubList = document.getElementById("pub-list");
const nextButton = document.getElementById("next-button");
const backButton = document.getElementById("back-button");
const resetButton = document.getElementById("reset-button");
const mapTitle = document.getElementById("map-title");
const modePlace = document.getElementById("mode-place");
const modeWalk = document.getElementById("mode-walk");
const mapFrame = document.getElementById("map-frame");
const mapOpenLink = document.getElementById("map-open-link");

// querySelectorAll grabs EVERY element that matches, so these are lists
const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");

// The sliding highlight is one tab wide, however many tabs there are
const tabIndicator = document.querySelector(".tab-indicator");
tabIndicator.style.width = "calc((100% - 12px) / " + tabButtons.length + ")";

// ===== TABS =====
// Which tab is showing. Remembered so a refresh keeps you on the same tab.
let activeTab = localStorage.getItem("activeTab") || "pub";

function showTab(name) {
  activeTab = name;
  localStorage.setItem("activeTab", name);

  // Show the matching section, hide the rest.
  // Each section's id is "tab-" + its name, e.g. "tab-map".
  tabPanels.forEach(function (panel) {
    panel.hidden = panel.id !== "tab-" + name;
  });

  // Highlight the matching button in the tab bar
  tabButtons.forEach(function (button, index) {
    const isActive = button.dataset.tab === name;
    button.classList.toggle("active", isActive);
    // Slide the glossy highlight across to this tab. translateX(100%)
    // moves it by its own width, i.e. exactly one tab along.
    if (isActive) tabIndicator.style.transform = "translateX(" + index * 100 + "%)";
  });

  if (name === "map") updateMap();
  window.scrollTo(0, 0);   // start each tab at the top
}

tabButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    // button.dataset.tab reads the data-tab="..." from the HTML
    showTab(button.dataset.tab);
  });
});

// ===== MAP TAB =====
// mapIndex: which pub the map is showing (starts on the current pub).
// mapMode:  "place" = just the pub's location
//           "walk"  = walking directions from the pub before it
let mapIndex = Math.min(currentIndex, pubs.length - 1);
let mapMode = "place";

function updateMap() {
  const pub = pubs[mapIndex];
  const previousPub = pubs[mapIndex - 1];   // undefined for the first pub

  // The first pub has no pub before it, so no walking directions
  if (!previousPub) mapMode = "place";
  modeWalk.hidden = !previousPub;
  if (previousPub) modeWalk.textContent = "🚶 Walk from " + previousPub.name;

  modePlace.classList.toggle("active", mapMode === "place");
  modeWalk.classList.toggle("active", mapMode === "walk");

  let embedUrl;
  if (mapMode === "walk") {
    mapTitle.textContent = previousPub.name + " ➜ " + pub.name;
    embedUrl = embedWalkUrl(previousPub, pub);
    mapOpenLink.href = directionsLink(previousPub, pub);
  } else {
    mapTitle.textContent = (mapIndex + 1) + ". " + pub.name;
    embedUrl = embedPlaceUrl(pub);
    mapOpenLink.href = mapLink(pub);
  }

  // Only reload the map if it's actually changed (reloading makes it flash)
  if (mapFrame.getAttribute("src") !== embedUrl) {
    mapFrame.src = embedUrl;
  }
}

modePlace.addEventListener("click", function () {
  mapMode = "place";
  updateMap();
});

modeWalk.addEventListener("click", function () {
  mapMode = "walk";
  updateMap();
});

// ===== TIMER =====
// Has the phone already buzzed for this pub? (So it only buzzes once.)
// If the time was already up when the page loaded, don't buzz again.
let timerAlerted = timerStart !== null && Date.now() - timerStart >= PUB_MINUTES * 60000;

function startTimer() {
  timerStart = Date.now();   // "now", in milliseconds
  timerAlerted = false;
  saveProgress();
  updateTimer();
}

// Turns a number of milliseconds into "mm:ss", e.g. 754000 -> "12:34"
function formatTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  // padStart adds a leading zero, so 5 becomes "05"
  return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

// Updates just the timer part of the screen. Runs every second.
function updateTimer() {
  if (currentIndex >= pubs.length) {
    timerBox.style.display = "none";   // no timer once the crawl is over
    return;
  }
  timerBox.style.display = "";

  if (timerStart === null) {
    // Not started yet
    timerDisplay.textContent = formatTime(PUB_MINUTES * 60000);
    timerMessage.textContent = "";
    timerButton.textContent = "▶ Start the " + PUB_MINUTES + "-minute timer";
    timerBox.classList.remove("times-up");
    return;
  }

  timerButton.textContent = "↻ Restart timer";
  const timeLeft = timerStart + PUB_MINUTES * 60000 - Date.now();

  if (timeLeft > 0) {
    timerDisplay.textContent = formatTime(timeLeft);
    timerMessage.textContent = "left at this pub";
    timerBox.classList.remove("times-up");
  } else {
    timerDisplay.textContent = "00:00";
    timerMessage.textContent = "⏰ Time's up! Drink up and move on";
    timerBox.classList.add("times-up");
    // Buzz the phone once. Only some phones support this (Android yes,
    // iPhone no), so we check it exists first.
    if (!timerAlerted && navigator.vibrate) {
      navigator.vibrate([400, 200, 400, 200, 400]);
    }
    timerAlerted = true;
  }
}

timerButton.addEventListener("click", function () {
  // Ask before restarting a timer that's already running
  if (timerStart !== null && !confirm("Restart the timer from " + PUB_MINUTES + ":00?")) {
    return;
  }
  startTimer();
});

// setInterval runs updateTimer every 1000 milliseconds (once a second)
setInterval(updateTimer, 1000);

// ===== PUNISHMENT WHEEL =====
// Slices are sized by weight. Work out where each slice starts and ends
// (in degrees) once, and keep them in a list.
//   Example: weights 4,1,1,1 add up to 7, so "Down your pint" gets 4/7
//   of the circle (about 206deg) and the others get 1/7 each (about 51deg).
const totalWeight = punishments.reduce(function (sum, p) {
  return sum + (p.weight || 1);
}, 0);

const sliceAngles = [];   // e.g. [{start: 0, end: 206}, {start: 206, end: 257}, ...]
let angleSoFar = 0;
punishments.forEach(function (p) {
  const size = ((p.weight || 1) / totalWeight) * 360;
  sliceAngles.push({ start: angleSoFar, end: angleSoFar + size });
  angleSoFar = angleSoFar + size;
});

// ----- Wheel measurements (must match style.css) -----
const WHEEL_SIZE = 300;   // .wheel-wrap width
const RIM = 14;           // .wheel inset (12px) + its border (2px)
const HUB_RADIUS = 34;    // half the SPIN button's width (68px)
const WHEEL_RADIUS = WHEEL_SIZE / 2 - RIM;   // the coloured part: 136px

// Slice colours. Each has a matching text colour that's easy to read on it.
const sliceStyles = [
  { bg: "#c8102e", text: "#ffffff" },   // red
  { bg: "#1f7a4d", text: "#ffffff" },   // green
  { bg: "#f2c14e", text: "#4a2f00" },   // gold
  { bg: "#fdf6e3", text: "#0f3d2e" },   // cream
  { bg: "#0f5c3a", text: "#ffffff" },   // deep green
  { bg: "#8e0c21", text: "#ffffff" },   // dark red
];

const hubButton = document.getElementById("hub-button");
let wheelHighlight;   // the dimming layer, made in buildWheel

// Splits a label into two lines if it's long, e.g.
// "Stranger selfie" -> ["Stranger", "selfie"]. Two shorter lines can use
// a much bigger font than one long line.
function splitLabel(text) {
  if (text.length <= 9 || !text.includes(" ")) return [text];
  // Find the space nearest the middle
  const middle = text.length / 2;
  let best = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === " " && (best === -1 || Math.abs(i - middle) < Math.abs(best - middle))) {
      best = i;
    }
  }
  return [text.slice(0, best), text.slice(best + 1)];
}

// Draw the wheel once when the page loads.
function buildWheel() {
  // Colour the slices. A "conic-gradient" is a colour sweep around a
  // centre point, like a pie chart. We list each slice's colour and where
  // it starts and ends. Each slice starts with a thin white line so the
  // slices are clearly separated.
  const slices = sliceAngles.map(function (a, i) {
    const style = sliceStyles[i % sliceStyles.length];
    const lineEnd = a.start + 0.6;   // the white line is 0.6 degrees wide
    return "rgba(255,255,255,0.85) " + a.start + "deg " + lineEnd + "deg, " +
           style.bg + " " + lineEnd + "deg " + a.end + "deg";
  });
  wheel.style.background = "conic-gradient(" + slices.join(", ") + ")";

  // Add a label for each slice
  punishments.forEach(function (p, i) {
    const style = sliceStyles[i % sliceStyles.length];
    const middle = (sliceAngles[i].start + sliceAngles[i].end) / 2;

    // Pull the emoji (if any) out of the label, so it can sit at the rim.
    // \p{Extended_Pictographic} means "any emoji character".
    const emojiMatch = p.label.match(/\p{Extended_Pictographic}/u);
    const emoji = emojiMatch ? emojiMatch[0] : "";
    const words = p.label.replace(/\p{Extended_Pictographic}️?/gu, "").trim();
    const lines = splitLabel(words);

    const label = document.createElement("div");
    label.className = "wheel-label";
    // The strip starts pointing right (3 o'clock). Turning it by
    // (middle - 90) points it at the middle of its slice.
    label.style.transform = "rotate(" + (middle - 90) + "deg)";

    const text = document.createElement("span");
    text.className = "label-text";
    text.style.color = style.text;
    // Dark text on light slices doesn't need a shadow; white text does
    if (style.text === "#ffffff") text.style.textShadow = "0 1px 2px rgba(0,0,0,0.5)";
    lines.forEach(function (line, n) {
      if (n > 0) text.appendChild(document.createElement("br"));
      text.appendChild(document.createTextNode(line));
    });

    // Font size: as big as fits between the SPIN button and the rim,
    // but never bigger than 16px. Letters are about 0.58 x the font size wide.
    const space = WHEEL_RADIUS - HUB_RADIUS - 14 - (emoji ? 24 : 0);
    const longest = Math.max.apply(null, lines.map(function (l) { return l.length; }));
    text.style.fontSize = Math.min(16, space / (longest * 0.58)) + "px";

    label.appendChild(text);
    if (emoji) {
      const icon = document.createElement("span");
      icon.className = "label-emoji";
      icon.textContent = emoji;
      label.appendChild(icon);
    }
    wheel.appendChild(label);
  });

  // The layer that dims the losing slices after a spin
  wheelHighlight = document.createElement("div");
  wheelHighlight.className = "wheel-highlight";
  wheel.appendChild(wheelHighlight);
}

// Dim every slice except the winner, so it's obvious where it landed
function highlightSlice(i) {
  const a = sliceAngles[i];
  const dim = "rgba(0,0,0,0.55)";
  wheelHighlight.style.background = "conic-gradient(" +
    dim + " 0deg " + a.start + "deg, " +
    "transparent " + a.start + "deg " + a.end + "deg, " +
    dim + " " + a.end + "deg 360deg)";
  wheelHighlight.classList.add("show");
}

// Tapping SPIN in the middle does the same as the big button
hubButton.addEventListener("click", function () {
  spinButton.click();
});

// ----- More elements for the wheel, crew and pop-up -----
const wheelWrap = document.getElementById("wheel-wrap");
const wheelLights = document.getElementById("wheel-lights");
const wheelPointer = document.querySelector(".wheel-pointer");
const picker = document.getElementById("picker");
const soundButton = document.getElementById("sound-button");
const resultOverlay = document.getElementById("result-overlay");
const resultAvatar = document.getElementById("result-avatar");
const resultName = document.getElementById("result-name");
const resultText = document.getElementById("result-text");
const resultClose = document.getElementById("result-close");
const confetti = document.getElementById("confetti");
const crewList = document.getElementById("crew-list");
const shameText = document.getElementById("shame-text");
const undoButton = document.getElementById("undo-button");

// Some people turn on "reduce motion" in their phone settings. If so, we
// make the spin short and skip the confetti.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ----- Lights around the wheel -----
// They also act as the "pegs": the pointer ticks each time one goes past.
const LIGHT_COUNT = 18;
const pegSize = 360 / LIGHT_COUNT;   // degrees between lights

function buildLights() {
  for (let i = 0; i < LIGHT_COUNT; i++) {
    // A full-size holder, turned to this light's angle...
    const holder = document.createElement("div");
    holder.className = "light-holder";
    holder.style.transform = "rotate(" + i * pegSize + "deg)";
    // ...with the light sitting at the top of it, on the rim
    const light = document.createElement("span");
    light.className = "light";
    if (i % 2 === 1) light.classList.add("odd");   // odd ones blink out of step
    holder.appendChild(light);
    wheelLights.appendChild(holder);
  }
}

// ----- Avatars (round photos, or initials if there's no photo) -----
const avatarColours = ["#c8102e", "#1b5e46", "#b8860b", "#6a1b9a", "#1565c0", "#d84315"];

// size is "small", "medium" or "large" (see .avatar in style.css)
function makeAvatar(person, size) {
  const box = document.createElement("div");
  box.className = "avatar " + size;
  box.style.background = avatarColours[people.indexOf(person) % avatarColours.length];

  // Initials, e.g. "Big Mick" -> "BM". These sit underneath the photo.
  const initials = person.name.split(" ").map(function (word) {
    return word[0];
  }).join("").slice(0, 2).toUpperCase();
  box.textContent = initials;

  if (person.photo) {
    const img = document.createElement("img");
    img.src = "photos/" + person.photo;
    img.alt = person.name;
    // If the photo file is missing, remove it so the initials show instead
    img.onerror = function () {
      img.remove();
    };
    box.appendChild(img);
  }
  return box;
}

// ----- Sound -----
// We make the sounds ourselves with the browser's built-in synthesiser
// (the "Web Audio API"), so there are no sound files to download.
let soundOn = localStorage.getItem("soundOn") !== "no";
let audio = null;

function updateSoundButton() {
  soundButton.textContent = soundOn ? "🔊" : "🔇";
}

// Browsers only allow sound after the user taps something, so we set
// up the synthesiser inside the Spin button's click.
function unlockAudio() {
  if (!soundOn) return;
  if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
  audio.resume();
}

// Plays one short note. freq = pitch, ms = length, volume = 0 to 1
function beep(freq, ms, volume) {
  if (!soundOn || !audio) return;
  const osc = audio.createOscillator();   // makes the tone
  const gain = audio.createGain();         // controls the volume
  osc.type = "triangle";
  osc.frequency.value = freq;
  // Start at full volume and fade out quickly, so it sounds like a "tick"
  gain.gain.setValueAtTime(volume, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + ms / 1000);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + ms / 1000);
}

// A little "ta-da!" at the end of the spin
function fanfare() {
  [523, 659, 784, 1047].forEach(function (note, i) {
    setTimeout(function () {
      beep(note, 250, 0.2);
    }, i * 120);
  });
}

soundButton.addEventListener("click", function () {
  soundOn = !soundOn;   // flip true <-> false
  localStorage.setItem("soundOn", soundOn ? "yes" : "no");
  updateSoundButton();
});

// ----- The punishment log -----
// Every spin is written down here: who, what, and at which pub.
// We store names (not numbers) so the log still makes sense if you
// reorder the lists later.
let punishmentLog = JSON.parse(localStorage.getItem("punishmentLog") || "[]");

function saveLog() {
  // localStorage can only hold text, so JSON.stringify turns the list into text
  localStorage.setItem("punishmentLog", JSON.stringify(punishmentLog));
}

// ----- "Who got caught?" picker -----
let selectedPerson = null;   // index into people, or null if nobody picked

function renderPicker() {
  picker.innerHTML = "";
  people.forEach(function (person, i) {
    const chip = document.createElement("button");
    chip.className = "picker-chip";
    if (i === selectedPerson) chip.classList.add("selected");

    chip.appendChild(makeAvatar(person, "small"));
    const name = document.createElement("span");
    name.textContent = person.name;
    chip.appendChild(name);

    chip.addEventListener("click", function () {
      if (spinning) return;   // no changing your mind mid-spin!
      selectedPerson = i;
      renderPicker();
    });
    picker.appendChild(chip);
  });
  updateSpinButton();
}

function updateSpinButton() {
  if (spinning) return;
  if (selectedPerson === null) {
    spinButton.disabled = true;
    spinButton.textContent = "👆 Pick who got caught";
  } else {
    spinButton.disabled = false;
    spinButton.textContent = "Spin for " + people[selectedPerson].name + " 🎡";
  }
  hubButton.disabled = spinButton.disabled;   // the SPIN hub matches the big button
}

// ----- Spinning -----
let wheelRotation = 0;   // how far the wheel has turned in total, in degrees
let spinning = false;

spinButton.addEventListener("click", function () {
  if (spinning || selectedPerson === null) return;
  unlockAudio();
  spinning = true;
  spinButton.disabled = true;
  hubButton.disabled = true;
  spinButton.textContent = "Spinning…";
  spinResult.textContent = "";
  wheelWrap.classList.add("spinning");   // makes the lights blink fast
  wheelHighlight.classList.remove("show");   // un-dim last spin's result

  // 1. Pick a random spot on the wheel (0 to 360 degrees). Bigger slices
  //    cover more of the circle, so they're more likely to be picked.
  const landingAngle = Math.random() * 360;

  // 2. Find which slice that spot is in
  let winner = sliceAngles.findIndex(function (a) {
    return landingAngle >= a.start && landingAngle < a.end;
  });
  // Tiny rounding errors can leave a sliver right at 360deg. Count it as the last slice.
  if (winner === -1) winner = punishments.length - 1;

  // 3. Work out where to stop so that spot ends up under the pointer.
  //    The pointer is at the top (0deg). Turning the wheel clockwise by
  //    (360 - spot) brings that spot to the top.
  const startRotation = wheelRotation;
  const fullTurns = (reduceMotion ? 1 : 6) * 360;   // a few full spins for drama
  const startOfThisTurn = wheelRotation - (wheelRotation % 360);
  const endRotation = startOfThisTurn + fullTurns + (360 - landingAngle);
  const duration = reduceMotion ? 1200 : SPIN_MS;

  // 4. Animate it ourselves, one frame at a time. requestAnimationFrame
  //    asks the browser to call our function just before it draws the
  //    next frame (about 60 times a second). Doing it this way means we
  //    know exactly where the wheel is, so we can tick at every peg.
  const startTime = performance.now();
  let lastPeg = Math.floor(startRotation / pegSize);

  function frame(now) {
    // t goes from 0 (start) to 1 (finished)
    const t = Math.min((now - startTime) / duration, 1);
    const WIND_UP = 0.07;   // the first 7% of the spin is a little pull-back
    const PULL_BACK = 12;   // degrees
    if (t < WIND_UP && !reduceMotion) {
      // Wind-up: ease backwards a touch, like a hand grabbing the wheel
      wheelRotation = startRotation - PULL_BACK * Math.sin((t / WIND_UP) * Math.PI / 2);
    } else {
      // Then let go. "Ease out": fast at first, then slows right down
      const t2 = reduceMotion ? t : (t - WIND_UP) / (1 - WIND_UP);
      const eased = 1 - Math.pow(1 - t2, 4);
      const from = reduceMotion ? startRotation : startRotation - PULL_BACK;
      wheelRotation = from + (endRotation - from) * eased;
    }
    wheel.style.transform = "rotate(" + wheelRotation + "deg)";

    // Has a peg gone past the pointer since the last frame? Tick!
    const peg = Math.floor(wheelRotation / pegSize);
    if (peg !== lastPeg) {
      lastPeg = peg;
      tick();
    }

    if (t < 1) {
      requestAnimationFrame(frame);   // keep going
    } else {
      finishSpin(winner);             // 5. done!
    }
  }
  requestAnimationFrame(frame);
});

// Click sound + flick the pointer
function tick() {
  beep(1800, 25, 0.15);
  // Removing and re-adding the class restarts the CSS animation.
  // Reading offsetWidth in between forces the browser to notice.
  wheelPointer.classList.remove("tick");
  void wheelPointer.offsetWidth;
  wheelPointer.classList.add("tick");
}

function finishSpin(winner) {
  spinning = false;
  wheelWrap.classList.remove("spinning");

  const punishment = punishments[winner];
  const person = people[selectedPerson];

  // Write it in the log
  const entry = {
    person: person.name,
    punishment: punishment.label,
    noPenalty: punishment.noPenalty === true,
    pub: pubs[Math.min(currentIndex, pubs.length - 1)].name,
    time: Date.now(),
    by: deviceId,   // which phone spun, so it doesn't pop up twice on it
  };
  if (window.sync) {
    // Shared: send it to the server. It comes straight back to every
    // phone (this one too) through applyLog, which updates the list.
    window.sync.addPunishment(entry);
  } else {
    punishmentLog.push(entry);
    saveLog();
  }

  spinResult.textContent = "🎯 " + person.name + ": " + punishment.detail;

  // Light up the winning slice, and give everyone a moment to see it
  // before the pop-up appears
  highlightSlice(winner);
  if (navigator.vibrate) navigator.vibrate(200);
  setTimeout(function () {
    showResult(person, punishment);
    fanfare();
  }, 800);

  // Ready for the next one
  selectedPerson = null;
  renderPicker();
  renderCrew();
}

// ----- Result pop-up -----
function showResult(person, punishment) {
  resultAvatar.innerHTML = "";
  resultAvatar.appendChild(makeAvatar(person, "large"));
  resultName.textContent = person.name + (person.nickname ? " “" + person.nickname + "”" : "");
  resultText.textContent = punishment.detail;
  resultOverlay.hidden = false;
  launchConfetti(punishment.noPenalty === true);
}

function launchConfetti(lucky) {
  if (reduceMotion) return;
  const symbols = lucky ? ["🎁", "✨", "🍀", "⭐"] : ["🍺", "🥃", "🎄", "✨", "🎉"];
  for (let i = 0; i < 40; i++) {
    const bit = document.createElement("span");
    bit.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    // Random position, size, speed and start time so they don't all fall together
    bit.style.left = Math.random() * 100 + "%";
    bit.style.fontSize = 16 + Math.random() * 18 + "px";
    bit.style.animationDuration = 2 + Math.random() * 1.5 + "s";
    bit.style.animationDelay = Math.random() * 0.6 + "s";
    confetti.appendChild(bit);
  }
}

resultClose.addEventListener("click", function () {
  resultOverlay.hidden = true;
  confetti.innerHTML = "";   // clear away the old confetti
});

// ===== CREW / HALL OF SHAME =====
function renderCrew() {
  // Work out each person's numbers from the log
  const stats = people.map(function (person, i) {
    const theirs = punishmentLog.filter(function (entry) {
      return entry.person === person.name;
    });
    const real = theirs.filter(function (entry) {
      return !entry.noPenalty;
    });
    return {
      person: person,
      order: i,
      count: real.length,                    // actual punishments
      escapes: theirs.length - real.length,  // times they got off scot free
      entries: real,
    };
  });

  // Most punished first. If it's a tie, keep the original order.
  stats.sort(function (a, b) {
    return b.count - a.count || a.order - b.order;
  });

  const top = stats[0];
  if (!top || top.count === 0) {
    shameText.textContent = "No punishments yet. Behave yourselves 😇";
  } else {
    shameText.textContent = "👑 " + top.person.name + " is leading with " +
      top.count + (top.count === 1 ? " punishment" : " punishments");
  }

  crewList.innerHTML = "";
  stats.forEach(function (s, rank) {
    const leader = rank === 0 && s.count > 0;
    const row = document.createElement("li");
    row.className = "crew-card";
    if (leader) row.classList.add("leader");

    const rankBox = document.createElement("span");
    rankBox.className = "crew-rank";
    rankBox.textContent = leader ? "👑" : rank + 1;

    const info = document.createElement("div");
    info.className = "crew-info";

    const name = document.createElement("span");
    name.className = "crew-name";
    name.textContent = s.person.name;
    info.appendChild(name);

    if (s.person.nickname) {
      const nick = document.createElement("span");
      nick.className = "crew-nickname";
      nick.textContent = "“" + s.person.nickname + "”";
      info.appendChild(nick);
    }

    // Summary like "Down your pint 🍺 ×2 · Shot 🥃 ×1"
    const tally = {};   // an empty object we fill up: { "Shot 🥃": 1, ... }
    s.entries.forEach(function (entry) {
      tally[entry.punishment] = (tally[entry.punishment] || 0) + 1;
    });
    const parts = Object.keys(tally).map(function (label) {
      return label + " ×" + tally[label];
    });
    if (s.escapes > 0) parts.push("Scot free ×" + s.escapes);

    const summary = document.createElement("small");
    summary.className = "crew-summary";
    summary.textContent = parts.length ? parts.join(" · ") : "Clean record so far";
    info.appendChild(summary);

    const count = document.createElement("div");
    count.className = "crew-count";
    count.innerHTML = s.count + "<small>" + (s.count === 1 ? "punishment" : "punishments") + "</small>";

    row.appendChild(rankBox);
    row.appendChild(makeAvatar(s.person, "medium"));
    row.appendChild(info);
    row.appendChild(count);
    crewList.appendChild(row);
  });

  undoButton.hidden = punishmentLog.length === 0;
}

// Fix a mistake: remove the most recent punishment from the log
undoButton.addEventListener("click", function () {
  const last = punishmentLog[punishmentLog.length - 1];
  if (confirm("Undo: " + last.person + " – " + last.punishment + "?")) {
    if (window.sync && last.id) {
      window.sync.removePunishment(last.id);   // removes it for everyone
    } else {
      punishmentLog.pop();   // pop removes the last item from a list
      saveLog();
    }
    spinResult.textContent = "";
    renderCrew();
  }
});

// ===== DRAW THE PAGE =====
function render() {
  const finished = currentIndex >= pubs.length;

  // Header: text and progress bar
  progressText.textContent = currentIndex + " of " + pubs.length + " pubs done";
  progressFill.style.width = (currentIndex / pubs.length) * 100 + "%";

  // Current pub card
  if (finished) {
    currentLabel.textContent = "You made it!";
    currentPub.textContent = "🎉 All 12 done 🎉";
    ruleCard.style.display = "none";   // no rule or directions once it's over
    mapButton.style.display = "none";
    nextButton.disabled = true;
    nextButton.textContent = "Merry Christmas!";
  } else {
    const pub = pubs[currentIndex];
    currentLabel.textContent = "Pub " + (currentIndex + 1) + " of " + pubs.length;
    currentPub.textContent = pub.name;

    // Rule card: put the rule on the back, flip it if already revealed
    ruleCard.style.display = "";
    ruleText.textContent = pub.rule;
    ruleCard.classList.toggle("flipped", ruleRevealed);

    mapButton.style.display = "";

    nextButton.disabled = false;
    nextButton.textContent = currentIndex === pubs.length - 1 ? "Finish 🏁" : "Next pub ➜";
  }

  updateTimer();

  backButton.style.visibility = currentIndex === 0 ? "hidden" : "visible";

  // Route list: empty it, then rebuild one row per pub
  pubList.innerHTML = "";
  pubs.forEach(function (pub, index) {
    const row = document.createElement("li");
    if (index < currentIndex) row.classList.add("done");
    if (index === currentIndex) row.classList.add("current");
    if (index === mapIndex) row.classList.add("selected");   // the one on the map

    // Tapping a row shows that pub on the map above
    row.addEventListener("click", function () {
      mapIndex = index;
      mapMode = "place";
      render();
      mapTitle.scrollIntoView({ behavior: "smooth" });
    });

    // Numbered circle (or a tick if done)
    const number = document.createElement("span");
    number.className = "pub-number";
    number.textContent = index < currentIndex ? "✓" : index + 1;

    // Name, plus the rule underneath, but only for pubs whose rule
    // has been revealed. Future rules stay secret!
    const info = document.createElement("div");
    info.className = "pub-info";

    const name = document.createElement("span");
    name.className = "pub-name";
    name.textContent = pub.name;
    info.appendChild(name);

    const shown = index < currentIndex || (index === currentIndex && ruleRevealed);
    if (shown) {
      const rule = document.createElement("small");
      rule.className = "pub-rule";
      rule.textContent = pub.rule;
      info.appendChild(rule);
    }

    // Little map pin, just a hint that the row can be tapped
    const pin = document.createElement("span");
    pin.className = "map-pin";
    pin.textContent = "📍";

    row.appendChild(number);
    row.appendChild(info);
    row.appendChild(pin);
    pubList.appendChild(row);
  });

  // Keep the map up to date, but only bother if you're looking at it
  if (activeTab === "map") updateMap();
}

// After moving between pubs, point the map at the new current pub
function resetMapToCurrentPub() {
  mapIndex = Math.min(currentIndex, pubs.length - 1);
  mapMode = "place";
}

// ===== BUTTONS =====
// Tapping the card reveals the rule. It only flips one way, so nobody
// un-reveals it by accident.
ruleCard.addEventListener("click", function () {
  if (!ruleRevealed) {
    ruleRevealed = true;
    saveProgress();
    render();
  }
});

// "Directions" on the Pub tab: jump to the Map tab showing the walk from
// the previous pub (or just the location, for the first pub)
mapButton.addEventListener("click", function () {
  mapIndex = currentIndex;
  mapMode = currentIndex > 0 ? "walk" : "place";
  render();
  showTab("map");
});

nextButton.addEventListener("click", function () {
  if (currentIndex < pubs.length) {
    currentIndex = currentIndex + 1;
    ruleRevealed = false;   // new pub = new hidden rule
    // New pub: timer goes back to "not started". The group taps
    // Start when they're ready.
    timerStart = null;
    resetMapToCurrentPub();
    saveProgress();
    render();
  }
});

backButton.addEventListener("click", function () {
  if (currentIndex > 0) {
    currentIndex = currentIndex - 1;
    ruleRevealed = true;    // we've already seen that pub's rule
    timerStart = null;      // timer goes back to "not started"
    resetMapToCurrentPub();
    saveProgress();
    render();
  }
});

resetButton.addEventListener("click", function () {
  const question = window.sync
    ? "Start the whole crawl again from pub 1 for EVERYONE? This also wipes the hall of shame."
    : "Start the whole crawl again from pub 1? This also wipes the hall of shame.";
  if (confirm(question)) {
    if (window.sync) window.sync.clearLog();
    currentIndex = 0;
    ruleRevealed = false;
    timerStart = null;
    resetMapToCurrentPub();
    saveProgress();
    punishmentLog = [];
    saveLog();
    spinResult.textContent = "";
    render();
    renderCrew();
  }
});

// ===== SNOW IN THE HEADER =====
function makeSnow() {
  if (reduceMotion) return;   // skip it for people who turn animations off
  const header = document.querySelector("header");
  const snow = document.createElement("div");
  snow.className = "snow";

  for (let i = 0; i < 30; i++) {
    const flake = document.createElement("span");
    flake.className = "flake";
    const size = 2 + Math.random() * 4;   // 2 to 6 pixels
    flake.style.width = size + "px";
    flake.style.height = size + "px";
    flake.style.left = Math.random() * 100 + "%";
    flake.style.opacity = 0.4 + Math.random() * 0.5;
    // Bigger flakes fall faster, which makes it look 3D
    flake.style.animationDuration = 10 - size + Math.random() * 3 + "s";
    // A negative delay means it starts part-way down, so the header
    // is already snowy when the page opens
    flake.style.animationDelay = -Math.random() * 10 + "s";
    // How far it drifts sideways while falling (-20 to +20 pixels)
    flake.style.setProperty("--drift", Math.random() * 40 - 20 + "px");
    snow.appendChild(flake);
  }
  header.appendChild(snow);
}

// ===== SHARING WITH THE CREW =====
// sync.js does the talking to the server. These are the functions it
// calls when something changes on someone else's phone.

// A random id for this phone, made once and remembered. Used to tell
// "my spin" apart from "someone else's spin".
let deviceId = localStorage.getItem("deviceId");
if (!deviceId) {
  deviceId = Math.random().toString(36).slice(2);
  localStorage.setItem("deviceId", deviceId);
}

// Someone moved pub, flipped the rule or started the timer
function applyProgress(data) {
  const newIndex = data.currentIndex || 0;
  const newTimer = data.timerStart || null;

  if (newIndex !== currentIndex) resetMapToCurrentPubAt(newIndex);
  if (newTimer !== timerStart) {
    // A new timer: buzz when it runs out (unless it's already over)
    timerAlerted = newTimer !== null && Date.now() - newTimer >= PUB_MINUTES * 60000;
  }

  currentIndex = newIndex;
  ruleRevealed = data.ruleRevealed === true;
  timerStart = newTimer;
  saveLocally();   // NOT saveProgress, or we'd send it straight back
  render();
}

function resetMapToCurrentPubAt(index) {
  mapIndex = Math.min(index, pubs.length - 1);
  mapMode = "place";
}

// The punishment list changed. Show the pop-up for any new punishment
// spun on someone else's phone, so the whole crew sees who got done.
let seenIds = null;   // ids we've already got. null = first load.

function applyLog(entries) {
  if (seenIds !== null) {
    entries.forEach(function (entry) {
      if (seenIds.has(entry.id) || entry.by === deviceId) return;
      const person = people.find(function (p) { return p.name === entry.person; });
      const punishment = punishments.find(function (p) { return p.label === entry.punishment; });
      if (person && punishment && resultOverlay.hidden) {
        showResult(person, punishment);
        if (navigator.vibrate) navigator.vibrate(200);
      }
    });
  }
  // A "Set" is a list that's quick to check: "is this id in it?"
  seenIds = new Set(entries.map(function (entry) { return entry.id; }));

  punishmentLog = entries;
  saveLog();
  renderCrew();
}

// The little badge in the header showing whether we're connected
const syncStatus = document.getElementById("sync-status");
const statusText = {
  local: "📱 This phone only",
  connecting: "⏳ Connecting…",
  live: "🟢 Live with the crew",
  offline: "🔴 No signal: will catch up",
};

function setStatus(state) {
  syncStatus.textContent = statusText[state];
  syncStatus.dataset.state = state;   // lets style.css colour it
}

// Hand these to sync.js
window.app = {
  applyProgress: applyProgress,
  applyLog: applyLog,
  setStatus: setStatus,
};

// Set everything up when the page first loads
makeSnow();
buildWheel();
buildLights();
updateSoundButton();
renderPicker();
renderCrew();
render();
showTab(activeTab);
