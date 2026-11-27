// ============================================================
// EDIT THIS PART: everything personal lives in CONFIG
// ============================================================
const CONFIG = {
  meName: "Prince",                      // your name
  herName: "Yukki",                      // her name
  meCity: "Quezon City",                 // where you are
  herCity: "Cebu City",                  // where she is
  meZone: "Asia/Manila",                 // Quezon City (same time zone as Cebu)
  herZone: "Asia/Manila",                // Cebu City
  mePhoto: "photos/me.jpg",              // put your picture in a "photos" folder
  herPhoto: "photos/her.jpg",            // and hers here
  sameZoneNote: "same time, about 570 km apart",  // shown between the clocks
  together: "2026-09-29",                // the day you got together (YYYY-MM-DD)
  meBirthday: "05-12",                   // your birthday (MM-DD, no year needed)
  herBirthday: "03-14",                  // her birthday (MM-DD, no year needed)
  footer: "Made for you my CUTEKKI",

  // Players you can pick in the games. color = ring color around the photo.
  // focus = where the face is in the photo (0 to 1), size = how much of the photo to show.
  characters: [
    { name: "YUKKI",  colorName: "Blue",  color: "#2f7bff", photo: "photos/her.jpg", focus: { x: 0.62, y: 0.38, size: 0.62 } },
    { name: "PRINCE", colorName: "Black", color: "#000000", photo: "photos/me.jpg",  focus: { x: 0.53, y: 0.50, size: 0.60 } },
  ],

  // Quick links for movie and game nights
  links: [
    { label: "Discord", url: "https://discord.com/app" },
    { label: "Teleparty", url: "https://www.teleparty.com" },
    { label: "Steam", url: "https://store.steampowered.com" },
  ],

  // Messages that rotate in "Reasons I love you"
  reasons: [
    "You make every call feel like we're in the same room.",
    "You laugh at my worst jokes.",
    "You're the first person I want to tell everything to.",
    "I love you more Baby.",
    "Every heartbeat whispers your name.",
    "You're my safe place in a chaotic world.",
    "Love isn't perfect, but it's always worth it.",
    "A million times over, I will always choose you.",
    "If I know what love is, it is because of you." ,
    "Loved you yesterday, love you still, always have, always will.",
    "The best thing to hold onto in life is each other.",
  ],

  // Starter lists (only used the first time; after that your lists are saved in the browser)
  movies: ["KOREAN DRAMA MOVIE", "ANIME DRAMA MOVIE", "NETFLIX SERIES", "ANIME FANTASY MOVIE", "KOREAN HORROR MOVIE", "THAI HORROR MOVIE"],
  games: ["FREEFIRE", "ROBLOX", "BEBETIME"],
};

// ============================================================
// Code below: change if you want to tweak how things work
// ============================================================
const $ = (id) => document.getElementById(id);

// ---- Clocks ----
function skyFor(hour) {
  if (hour >= 5 && hour < 7) return "dawn";
  if (hour >= 7 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}

function partsIn(zone) {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: zone });
  const day = now.toLocaleDateString([], { weekday: "long", timeZone: zone });
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: zone }).format(now));
  return { time, day, hour };
}

function offsetHours(zone) {
  // The zone's UTC offset in hours at this moment
  const now = new Date();
  const local = new Date(now.toLocaleString("en-US", { timeZone: zone }));
  const utc = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
  return (local - utc) / 3600000;
}

function updateClocks() {
  const me = partsIn(CONFIG.meZone);
  const her = partsIn(CONFIG.herZone);
  $("meTime").textContent = me.time;
  $("meDay").textContent = me.day;
  $("meSide").dataset.sky = skyFor(me.hour);
  $("herTime").textContent = her.time;
  $("herDay").textContent = her.day;
  $("herSide").dataset.sky = skyFor(her.hour);

  const diff = Math.abs(offsetHours(CONFIG.meZone) - offsetHours(CONFIG.herZone));
  $("gap").textContent = diff === 0 ? CONFIG.sameZoneNote : `${diff} hours apart`;
}

// ---- Counters ----
function updateCounters() {
  const msPerDay = 86400000;
  const since = new Date(CONFIG.together + "T00:00:00");
  $("daysTogether").textContent = Math.max(0, Math.floor((Date.now() - since) / msPerDay)).toLocaleString();

  updateBirthday("herBday", "herBdayLabel", CONFIG.herBirthday, CONFIG.herName);
  updateBirthday("meBday", "meBdayLabel", CONFIG.meBirthday, CONFIG.meName);
}

// Days until the next birthday (accepts MM-DD or YYYY-MM-DD, the year is ignored)
function nextBirthday(iso) {
  const [m, d] = iso.split("-").map(Number).slice(-2);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let year = today.getFullYear();
  let next = new Date(year, m - 1, d);
  if (next < today) {
    year++;
    next = new Date(year, m - 1, d);
  }
  return { days: Math.round((next - today) / 86400000) };
}

function updateBirthday(numId, labelId, iso, name) {
  const { days } = nextBirthday(iso);
  $(numId).textContent = days === 0 ? "Today" : days.toLocaleString();
  $(labelId).textContent = days === 0 ? `Happy birthday, ${name}!` : `days until ${name}'s birthday`;
}

// ---- Movie and game lists (saved in this browser) ----
const lists = {};

function loadList(key) {
  try {
    const saved = localStorage.getItem("list-" + key);
    if (saved) return JSON.parse(saved);
  } catch (e) { /* storage unavailable, fall back to starters */ }
  return CONFIG[key].map((text) => ({ text, done: false }));
}

function saveList(key) {
  try { localStorage.setItem("list-" + key, JSON.stringify(lists[key])); } catch (e) {}
}

function renderList(key) {
  const ul = $(key);
  ul.innerHTML = "";
  lists[key].forEach((item, i) => {
    const li = document.createElement("li");
    if (item.done) li.className = "done";

    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = item.done;
    box.setAttribute("aria-label", "Mark done: " + item.text);
    box.onchange = () => { item.done = box.checked; saveList(key); renderList(key); };

    const label = document.createElement("span");
    label.textContent = item.text;

    const remove = document.createElement("button");
    remove.className = "remove";
    remove.textContent = "Remove";
    remove.onclick = () => { lists[key].splice(i, 1); saveList(key); renderList(key); };

    li.append(box, label, remove);
    ul.append(li);
  });
}

["movies", "games"].forEach((key) => {
  lists[key] = loadList(key);
  renderList(key);
});

document.querySelectorAll("form.add").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const key = form.dataset.list;
    const input = form.querySelector("input");
    const text = input.value.trim();
    if (!text) return;
    lists[key].push({ text, done: false });
    saveList(key);
    renderList(key);
    input.value = "";
  });
});

// ---- Random pick, with pop-up and confetti ----
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const modal = $("pickModal");
let spinTimer = null;
let lastFocus = null;
let currentKind = "movies";

function openModal() {
  if (modal.hidden) lastFocus = document.activeElement;
  modal.hidden = false;
  $("pickAgain").focus();
}

function closeModal() {
  clearInterval(spinTimer);
  modal.hidden = true;
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

function pickRandom(key) {
  currentKind = key;
  clearInterval(spinTimer);
  const open = lists[key].filter((x) => !x.done);
  const noun = key === "movies" ? "movie" : "game";
  $("pickKind").textContent = open.length ? `Tonight's ${noun} is...` : `No ${noun} left`;
  openModal();

  if (!open.length) {
    $("pickWinner").textContent = `Everything on the ${key} list is done. Add something new.`;
    $("pickResult").textContent = `Nothing left in the ${key} list. Add something new.`;
    return;
  }

  const winner = open[Math.floor(Math.random() * open.length)].text;
  const land = () => {
    $("pickWinner").textContent = winner;
    $("pickResult").textContent = winner;
    launchConfetti();
  };

  if (reduceMotion || open.length === 1) { land(); return; }

  // Quick shuffle through the options before landing on the pick
  let ticks = 0;
  spinTimer = setInterval(() => {
    ticks++;
    if (ticks >= 10) { clearInterval(spinTimer); land(); return; }
    $("pickWinner").textContent = open[Math.floor(Math.random() * open.length)].text;
  }, 80);
}

document.querySelectorAll("[data-pick]").forEach((btn) => {
  btn.onclick = () => pickRandom(btn.dataset.pick);
});
$("pickAgain").onclick = () => pickRandom(currentKind);
$("pickClose").onclick = closeModal;
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });

// Confetti: a burst from the middle of the screen that falls with gravity
const confettiCanvas = $("confetti");
const cctx = confettiCanvas.getContext("2d");
let confettiPieces = [];
let confettiFrame = null;

function sizeConfetti() {
  const dpr = window.devicePixelRatio || 1;
  confettiCanvas.width = window.innerWidth * dpr;
  confettiCanvas.height = window.innerHeight * dpr;
  cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", sizeConfetti);
sizeConfetti();

function launchConfetti() {
  if (reduceMotion) return;
  const colors = ["#ff8fa3", "#f2b84b", "#d6dcff", "#8fc9ff", "#ffffff", "#b58cff"];
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight * 0.45;
  for (let i = 0; i < 160; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2;
    const speed = 6 + Math.random() * 10;
    confettiPieces.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: 6 + Math.random() * 6,
      h: 4 + Math.random() * 5,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
    });
  }
  if (!confettiFrame) confettiFrame = requestAnimationFrame(stepConfetti);
}

function stepConfetti() {
  cctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  confettiPieces = confettiPieces.filter((p) => p.y < window.innerHeight + 30 && p.life < 240);
  confettiPieces.forEach((p) => {
    p.life++;
    p.vy += 0.3;          // gravity
    p.vx *= 0.99;         // air drag
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    cctx.save();
    cctx.translate(p.x, p.y);
    cctx.rotate(p.rot);
    cctx.globalAlpha = Math.max(0, 1 - p.life / 240);
    cctx.fillStyle = p.color;
    cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    cctx.restore();
  });
  if (confettiPieces.length) {
    confettiFrame = requestAnimationFrame(stepConfetti);
  } else {
    confettiFrame = null;
    cctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

// ---- Links, reasons, footer ----
CONFIG.links.forEach((l) => {
  const a = document.createElement("a");
  a.href = l.url;
  a.textContent = l.label;
  a.target = "_blank";
  a.rel = "noopener";
  $("links").append(a);
});

let reasonIndex = Math.floor(Math.random() * CONFIG.reasons.length);
function showReason() { $("reason").textContent = CONFIG.reasons[reasonIndex]; }
$("nextReason").onclick = () => { reasonIndex = (reasonIndex + 1) % CONFIG.reasons.length; showReason(); };
showReason();

// ---- Photos: shown only if the image file exists ----
[["mePhoto", CONFIG.mePhoto, CONFIG.meName], ["herPhoto", CONFIG.herPhoto, CONFIG.herName]].forEach(([id, src, name]) => {
  const img = $(id);
  if (!src) return;
  img.onload = () => { img.hidden = false; };
  img.onerror = () => { img.hidden = true; };
  img.alt = name;
  img.src = src;
});

$("mePlace").textContent = CONFIG.meCity;
$("herPlace").textContent = CONFIG.herCity;
$("meName").textContent = CONFIG.meName;
$("herName").textContent = CONFIG.herName;
$("footer").textContent = CONFIG.footer;
document.title = `${CONFIG.meName} & ${CONFIG.herName}`;

updateClocks();
updateCounters();
setInterval(updateClocks, 1000);
setInterval(updateCounters, 60000);

// ============================================================
// Shared helpers for the games
// ============================================================
const games = {};   // each game registers a stop() here so switching games pauses the old one

function loadHigh(key) { try { return Number(localStorage.getItem(key)) || 0; } catch (e) { return 0; } }
function saveHigh(key, v) { try { localStorage.setItem(key, String(v)); } catch (e) {} }
function loadImg(src, onReady) {
  const img = new Image();
  img.onload = () => onReady(img);
  if (src) img.src = src;
  return img;
}
function pointerXY(canvas, e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
}
// The player you picked (saved in this browser). Every game draws it with drawChar().
const chars = CONFIG.characters.map((c) => {
  const o = { ...c, ready: false };
  o.img = loadImg(c.photo, () => { o.ready = true; redrawGames(); });
  return o;
});
let charIndex = 0;
try {
  const saved = Number(localStorage.getItem("character"));
  if (Number.isInteger(saved) && saved >= 0 && saved < chars.length) charIndex = saved;
} catch (e) {}

function redrawGames() { Object.values(games).forEach((g) => g.redraw && g.redraw()); }

function drawChar(ctx, x, y, r) {
  const c = chars[charIndex];
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  if (c.ready) {
    const w = c.img.width, h = c.img.height;
    const f = c.focus || { x: 0.5, y: 0.5, size: 1 };
    const side = Math.min(w, h) * f.size;
    const sx = Math.max(0, Math.min(w - side, f.x * w - side / 2));
    const sy = Math.max(0, Math.min(h - side, f.y * h - side / 2));
    ctx.drawImage(c.img, sx, sy, side, side, x - r, y - r, r * 2, r * 2);
  } else {
    ctx.fillStyle = c.color;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
  // Colored ring with a thin light edge so a black ring still shows on the dark background
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(255,255,255,.85)";
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.strokeStyle = c.color;
  ctx.stroke();
}
function bannerOn(ctx, W, H, b) {
  if (b.t <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, b.t / 0.5);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ff8fa3";
  ctx.font = '700 36px "Bricolage Grotesque", system-ui, sans-serif';
  ctx.fillText(b.text, W / 2, H * 0.34);
  if (b.sub) {
    ctx.fillStyle = "#eceeff";
    ctx.font = '400 16px "Figtree", system-ui, sans-serif';
    ctx.fillText(b.sub, W / 2, H * 0.34 + 28);
  }
  ctx.restore();
}
function barOn(ctx, x, y, w, h, frac, label) {
  ctx.fillStyle = "#2c2f5c";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#ff5a6e";
  ctx.fillRect(x, y, w * Math.max(0, frac), h);
  ctx.strokeStyle = "rgba(255,255,255,.6)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
  if (label) {
    ctx.fillStyle = "#eceeff";
    ctx.font = '700 12px "Figtree", system-ui, sans-serif';
    ctx.textAlign = "left";
    ctx.fillText(label, x, y - 4);
  }
}
function overlayOn(ctx, W, H, title, lines) {
  ctx.fillStyle = "rgba(10,11,30,.78)";
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.fillStyle = "#eceeff";
  ctx.font = '700 36px "Bricolage Grotesque", system-ui, sans-serif';
  ctx.fillText(title, W / 2, H / 2 - 24);
  ctx.font = '400 17px "Figtree", system-ui, sans-serif';
  ctx.fillStyle = "#9aa0cf";
  lines.filter(Boolean).forEach((t, i) => ctx.fillText(t, W / 2, H / 2 + 10 + i * 25));
}

// ============================================================
// Cheat codes and buffs (shared by all three games)
// ============================================================
// Type a code anywhere on the keyboard, or use the box under the game tabs.
// Typing the same code again turns it off.
//   IMMORTAL  never take damage
//   X2        every point you earn counts double
//   GHOST     see-through, and nothing can touch you
//   ALLBUFF   every buff of the game is always on
const cheats = { immortal: false, x2: false, ghost: false, allbuff: false, slowed: false };
const CHEAT_CODES = { IMMORTAL: "immortal", X2: "x2", GHOST: "ghost", ALLBUFF: "allbuff", SLOWED: "slowed" };
const CHEAT_NAMES = { immortal: "IMMORTAL", x2: "X2 POINTS", ghost: "GHOST", allbuff: "ALL BUFFS", slowed: "SLOWED" };
const mult = () => (cheats.x2 ? 2 : 1);

// SLOWED: every enemy moves at 40% speed for 30 seconds, then the cheat switches itself off.
// Type SLOWED again to use it again (typing it while it is active restarts the 30 seconds).
let slowT = 0;
const SLOWED_SECONDS = 30;
const enemySlow = () => (cheats.slowed ? 0.4 : 1);
let quietEnd = false;   // true while switching game tabs, so that does not count as dying

// Boss levels get harder one by one: Easy, Medium, Hard, then Insane from then on
const TIERS = ["Easy", "Medium", "Hard", "Insane"];
const tierName = (n) => TIERS[Math.min(TIERS.length - 1, n)];
const bossLabel = (lv) => `BOSS ${lv + 1} · ${tierName(lv).toUpperCase()}`;

// Buffs that boss fights drop as glowing orbs
const BUFFS = {
  rapid:  { color: "#ffd76a", glyph: "R", name: "Rapid fire" },
  spread: { color: "#8fc9ff", glyph: "3", name: "Triple shot" },
  shield: { color: "#7cf5c8", glyph: "S", name: "Shield (blocks one hit)" },
  heart:  { color: "#ff8fa3", glyph: "♥", name: "Extra life" },
  slowed: { color: "#8ff0ff", glyph: "Z", name: "Enemies slowed" },
  slow:   { color: "#b58cff", glyph: "T", name: "Slow motion" },
  power:  { color: "#ff7a3c", glyph: "P", name: "Power hit (double damage)" },
};

function makeBuffs(kinds) {
  const b = { t: {}, cool: 0 };
  kinds.forEach((k) => { b.t[k] = 0; });
  b.clear = () => { kinds.forEach((k) => { b.t[k] = 0; }); b.cool = 0; };
  // ALLBUFF keeps every buff on. The shield needs 2.5 s to recharge after it takes a hit.
  b.has = (k) => {
    if (b.t[k] > 0) return true;
    if (!cheats.allbuff) return false;
    return k !== "shield" || b.cool <= 0;
  };
  b.give = (k) => { b.t[k] = 10; };
  b.tick = (dt) => {
    kinds.forEach((k) => { b.t[k] = Math.max(0, b.t[k] - dt); });
    b.cool = Math.max(0, b.cool - dt);
    if (cheats.slowed) {
      slowT -= dt;
      if (slowT <= 0) {
        slowT = 0;
        cheats.slowed = false;
        updateCheatStatus();
        showToast("SLOWED ran out. Type SLOWED again to use it.");
      }
    }
  };
  b.absorb = () => {   // true when the shield took the hit
    if (!b.has("shield")) return false;
    b.t.shield = 0;
    b.cool = 2.5;
    return true;
  };
  b.list = () => kinds.filter((k) => b.has(k)).map((k) => [k, b.t[k] > 0 ? b.t[k] : Infinity])
    .concat(cheats.slowed ? [["slowed", slowT]] : []);
  return b;
}

function drawPickup(ctx, x, y, kind, life) {
  if (life !== undefined && life < 2 && Math.floor(life * 6) % 2) return;   // blinks before it vanishes
  const b = BUFFS[kind];
  const pulse = 1 + Math.sin(performance.now() / 160) * 0.08;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(pulse, pulse);
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(10,11,30,.85)";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = b.color;
  ctx.stroke();
  ctx.fillStyle = b.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = '700 15px "Bricolage Grotesque", system-ui, sans-serif';
  ctx.fillText(b.glyph, 0, 1);
  ctx.restore();
}

function drawShield(ctx, x, y, r) {
  ctx.save();
  ctx.globalAlpha = 0.6 + Math.sin(performance.now() / 120) * 0.2;
  ctx.beginPath();
  ctx.arc(x, y, r + 7, 0, Math.PI * 2);
  ctx.lineWidth = 3;
  ctx.strokeStyle = BUFFS.shield.color;
  ctx.stroke();
  ctx.restore();
}

// Small chips under the boss bar: which buffs are on and for how many seconds
function drawBuffChips(ctx, items) {
  let x = 10;
  ctx.save();
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.font = '700 12px "Figtree", system-ui, sans-serif';
  items.forEach(([kind, t]) => {
    const b = BUFFS[kind];
    const label = b.glyph + " " + (isFinite(t) ? Math.ceil(t) : "∞");
    const w = ctx.measureText(label).width + 14;
    ctx.fillStyle = "rgba(10,11,30,.8)";
    ctx.fillRect(x, 40, w, 20);
    ctx.strokeStyle = b.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, 40, w, 20);
    ctx.fillStyle = b.color;
    ctx.fillText(label, x + 7, 51);
    x += w + 6;
  });
  ctx.restore();
}

const cheatToast = $("cheatToast"), cheatStatus = $("cheatStatus");
let toastTimer = null;
function showToast(msg) {
  cheatToast.textContent = msg;
  cheatToast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { cheatToast.hidden = true; }, 2200);
}
function updateCheatStatus() {
  const on = Object.keys(cheats).filter((k) => cheats[k]).map((k) => CHEAT_NAMES[k]);
  cheatStatus.textContent = on.length ? "Cheats on: " + on.join(", ") : "No cheats on. Type a code on your keyboard or use the box above.";
}
function toggleCheat(key) {
  if (key === "slowed") {
    cheats.slowed = true;
    slowT = SLOWED_SECONDS;
    updateCheatStatus();
    showToast(`SLOWED on for ${SLOWED_SECONDS} seconds`);
    redrawGames();
    return;
  }
  cheats[key] = !cheats[key];
  updateCheatStatus();
  showToast(`${CHEAT_NAMES[key]} ${cheats[key] ? "on" : "off"}`);
  Object.values(games).forEach((g) => g.onCheat && g.onCheat(key, cheats[key]));
  redrawGames();
}

// Dying or pressing Restart clears every cheat (the orb buffs are cleared by each game)
function resetCheats() {
  const any = Object.keys(cheats).some((k) => cheats[k]);
  Object.keys(cheats).forEach((k) => { cheats[k] = false; });
  slowT = 0;
  updateCheatStatus();
  if (any) showToast("Cheats and buffs reset");
}

let typedKeys = "";
window.addEventListener("keydown", (e) => {
  const t = e.target;
  if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
  if (e.ctrlKey || e.metaKey || e.altKey || !e.key || e.key.length !== 1) return;
  typedKeys = (typedKeys + e.key.toUpperCase()).slice(-12);
  for (const code in CHEAT_CODES) {
    if (typedKeys.endsWith(code)) { typedKeys = ""; toggleCheat(CHEAT_CODES[code]); break; }
  }
});
$("cheatForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("cheatInput");
  const key = CHEAT_CODES[input.value.trim().toUpperCase()];
  if (key) toggleCheat(key); else showToast("Unknown code");
  input.value = "";
});
updateCheatStatus();

// ============================================================
// Zombie shooter (best score is saved in this browser)
// ============================================================
(function () {
  const canvas = $("zCanvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const HS_KEY = "zombie-highscore";
  const scoreEl = $("zScore"), highEl = $("zHigh"), livesEl = $("zLives"), startBtn = $("zStart");

  let high = 0;
  try { high = Number(localStorage.getItem(HS_KEY)) || 0; } catch (e) {}
  highEl.textContent = high;

  let state = "idle";   // idle | playing | over
  let overAt = 0;
  let player = { x: W / 2, y: H / 2, r: 22 };
  let bullets = [], zombies = [], particles = [];
  let score = 0, lives = 3, spawnTimer = 0, elapsed = 0, lastTime = 0;
  let aim = -Math.PI / 2, fireCooldown = 0, holding = false, hurt = 0, newBest = false;
  const keys = {};
  const buffs = makeBuffs(["rapid", "spread", "shield"]);
  let pickups = [], pickupT = 0;

  function reset() {
    player = { x: W / 2, y: H / 2, r: 22 };
    bullets = []; zombies = []; particles = [];
    spits = []; boss = null; bossCount = 0; nextBoss = 300; banner.t = 0;
    pickups = []; pickupT = 0; buffs.clear();
    score = 0; lives = cheats.allbuff ? 5 : 3; spawnTimer = 0.5; elapsed = 0; hurt = 0; newBest = false;
    fireCooldown = 0;
    updateHud();
  }

  function updateHud() {
    scoreEl.textContent = score;
    highEl.textContent = high;
    livesEl.textContent = lives > 0 ? "♥".repeat(lives) : "0";
    livesEl.setAttribute("aria-label", lives + " lives left");
  }

  function addScore(n) { score += n * mult(); }

  // Boss fights drop glowing orbs: rapid fire, triple shot, shield or an extra life
  function updatePickups(dt) {
    if (boss) {
      pickupT -= dt;
      if (pickupT <= 0) {
        pickupT = 5 + Math.random() * 2;
        const kinds = ["rapid", "spread", "shield", "heart"];
        pickups.push({ x: 50 + Math.random() * (W - 100), y: 70 + Math.random() * (H - 130), kind: kinds[Math.floor(Math.random() * kinds.length)], life: 9 });
      }
    }
    pickups.forEach((p) => { p.life -= dt; });
    for (const p of pickups) {
      if (Math.hypot(p.x - player.x, p.y - player.y) < player.r + 14) {
        p.life = 0;
        if (p.kind === "heart") { lives = Math.min(5, lives + 1); updateHud(); }
        else buffs.give(p.kind);
        burst(p.x, p.y, BUFFS[p.kind].color, 14);
      }
    }
    pickups = pickups.filter((p) => p.life > 0);
  }

  function start() {
    if (state === "playing") resetCheats();   // pressing Restart clears every cheat and buff
    reset();
    state = "playing";
    startBtn.blur();   // so Space does not press the button again
    startBtn.textContent = "Restart";
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  function endGame() {
    state = "over";
    buffs.clear();                      // dying clears every buff...
    if (!quietEnd) resetCheats();       // ...and every cheat
    overAt = performance.now();
    holding = false;
    if (score > high) {
      high = score;
      newBest = true;
      try { localStorage.setItem(HS_KEY, String(high)); } catch (e) {}
    }
    updateHud();
    startBtn.textContent = "Play again";
  }

  function spawnZombie() {
    // Come in from a random edge
    const side = Math.floor(Math.random() * 4);
    const pad = 30;
    let x, y;
    if (side === 0) { x = Math.random() * W; y = -pad; }
    else if (side === 1) { x = W + pad; y = Math.random() * H; }
    else if (side === 2) { x = Math.random() * W; y = H + pad; }
    else { x = -pad; y = Math.random() * H; }
    const tough = elapsed > 25 && Math.random() < 0.25;
    zombies.push({
      x, y,
      r: tough ? 21 : 16,
      hp: tough ? 3 : 1,
      maxhp: tough ? 3 : 1,
      speed: Math.min(120, 38 + elapsed * 1.3 + Math.random() * 20) * (tough ? 0.75 : 1),
      wobble: Math.random() * 6,
      angle: 0,
    });
  }

  function burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = 40 + Math.random() * 160;
      particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.4 + Math.random() * 0.3, t: 0, color });
    }
  }

  // ---- Boss: a giant zombie that spits, calls minions and chases you ----
  let boss = null, spits = [], bossCount = 0, nextBoss = 300;
  const banner = { text: "", sub: "", t: 0 };

  // Every boss is tougher than the last: more health, faster, spits and calls minions more often
  function spawnBoss() {
    const lv = bossCount;
    const hp = 20 + 14 * lv;
    boss = { x: W / 2, y: -70, r: 46, hp, maxhp: hp, speed: Math.min(72, 26 + 6 * lv), stun: 0, spitT: 2, minionT: 3, flash: 0, angle: Math.PI / 2, lv };
    banner.text = `BOSS ${lv + 1}`;
    banner.sub = `${tierName(lv)}: shoot it down before it reaches you`;
    banner.t = 2.4;
    pickupT = 1.5;
  }

  function defeatBoss() {
    addScore(200 + 100 * bossCount);
    bossCount++;
    zombies.forEach((z) => burst(z.x, z.y, "#6fae5b", 10));
    zombies = [];
    spits = [];
    burst(boss.x, boss.y, "#8fd36b", 50);
    burst(boss.x, boss.y, "#ffd76a", 30);
    banner.text = "BOSS DEFEATED";
    banner.sub = "Bonus points!";
    banner.t = 2.4;
    boss = null;
    nextBoss = score + 300;
    updateHud();
  }

  function hurtPlayer() {
    if (cheats.immortal || cheats.ghost) return;
    if (buffs.absorb()) { burst(player.x, player.y, "#7cf5c8", 18); return; }
    lives--;
    hurt = 0.4;
    burst(player.x, player.y, "#ff5a6e", 14);
    updateHud();
    if (lives <= 0) endGame();
  }

  function updateBoss(dt) {
    banner.t = Math.max(0, banner.t - dt);
    if (state !== "playing") return;
    if (!boss) { if (score >= nextBoss) spawnBoss(); return; }

    const phase2 = boss.hp < boss.maxhp / 2;
    boss.flash = Math.max(0, boss.flash - dt);
    boss.stun = Math.max(0, boss.stun - dt);
    const a = Math.atan2(player.y - boss.y, player.x - boss.x);
    boss.angle = a;
    if (boss.stun <= 0) {
      const sp = boss.speed * (phase2 ? 1.6 : 1);
      boss.x += Math.cos(a) * sp * dt * enemySlow();
      boss.y += Math.sin(a) * sp * dt * enemySlow();
    }

    // Your shots hurt the boss, and can pop its spit
    bullets.forEach((b) => {
      if (!b.dead && Math.hypot(b.x - boss.x, b.y - boss.y) < boss.r + 3) {
        b.dead = true;
        boss.hp--;
        boss.flash = 0.1;
        burst(b.x, b.y, "#c8f5a8", 3);
      }
      spits.forEach((s) => {
        if (!b.dead && !s.dead && Math.hypot(b.x - s.x, b.y - s.y) < s.r + 4) {
          b.dead = true; s.dead = true;
          burst(s.x, s.y, "#c8f5a8", 6);
        }
      });
    });
    bullets = bullets.filter((b) => !b.dead);
    if (boss.hp <= 0) { defeatBoss(); return; }

    // It spits at you (three at once when it is hurt) and calls in minions
    boss.spitT -= dt * enemySlow();
    if (boss.spitT <= 0) {
      const gap = Math.max(0.9, 2.4 - 0.3 * boss.lv);
      boss.spitT = phase2 ? gap * 0.62 : gap;
      const n = phase2 ? 3 : boss.lv >= 2 ? 2 : 1;
      const sv = 180 + 14 * boss.lv;
      for (let i = 0; i < n; i++) {
        const ang = a + (i - (n - 1) / 2) * 0.32;
        spits.push({ x: boss.x, y: boss.y, vx: Math.cos(ang) * sv, vy: Math.sin(ang) * sv, r: 8 });
      }
    }
    boss.minionT -= dt * enemySlow();
    if (boss.minionT <= 0) {
      boss.minionT = Math.max(1.8, 3.6 - 0.35 * boss.lv);
      for (let i = 0; i < 2; i++) {
        zombies.push({ x: boss.x + (i ? 24 : -24), y: boss.y, r: 16, hp: 1, maxhp: 1, speed: 62 + 6 * boss.lv, wobble: 0, angle: 0 });
      }
    }

    spits.forEach((s) => { s.x += s.vx * dt * enemySlow(); s.y += s.vy * dt * enemySlow(); });
    for (const s of spits) {
      if (!s.dead && !cheats.ghost && Math.hypot(s.x - player.x, s.y - player.y) < s.r + player.r - 4) {
        s.dead = true;
        hurtPlayer();
        if (state !== "playing") return;
      }
    }
    spits = spits.filter((s) => !s.dead && s.x > -40 && s.x < W + 40 && s.y > -40 && s.y < H + 40);

    // Touching the boss costs a life and knocks it back
    if (!cheats.ghost && Math.hypot(boss.x - player.x, boss.y - player.y) < boss.r + player.r - 6) {
      hurtPlayer();
      boss.stun = 1.2;
      boss.x = player.x - Math.cos(a) * 190;
      boss.y = player.y - Math.sin(a) * 190;
    }
  }

  function drawBoss() {
    spits.forEach((s) => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "#b6f06a";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#4a7a40";
      ctx.stroke();
    });
    if (!boss) return;
    const phase2 = boss.hp < boss.maxhp / 2;
    const r = boss.r;
    ctx.save();
    ctx.translate(boss.x, boss.y);
    ctx.rotate(boss.angle);
    ctx.fillStyle = "#4f7d44";
    ctx.fillRect(r - 8, -r * 0.95, r * 0.9, 9);
    ctx.fillRect(r - 8, r * 0.95 - 9, r * 0.9, 9);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = boss.flash > 0 ? "#e9ffd8" : phase2 ? "#9a5a3a" : "#5c8f3c";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ffd76a";
    ctx.stroke();
    ctx.fillStyle = "#ff3b4d";
    ctx.beginPath(); ctx.arc(r * 0.42, -r * 0.34, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.42, r * 0.34, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1f3a1a";
    ctx.fillRect(r * 0.55, -r * 0.2, 8, r * 0.4);
    ctx.restore();
  }

  function drawBossUi() {
    if (boss) barOn(ctx, 120, 24, W - 240, 10, boss.hp / boss.maxhp, bossLabel(boss.lv));
    bannerOn(ctx, W, H, banner);
  }

  function shoot() {
    if (fireCooldown > 0) return;
    fireCooldown = buffs.has("rapid") ? 0.08 : 0.17;
    const offsets = buffs.has("spread") ? [-0.2, 0, 0.2] : [0];
    offsets.forEach((o) => {
      const a = aim + o;
      bullets.push({ x: player.x + Math.cos(a) * 28, y: player.y + Math.sin(a) * 28, vx: Math.cos(a) * 640, vy: Math.sin(a) * 640 });
    });
  }

  function update(dt) {
    elapsed += dt;
    fireCooldown -= dt;
    hurt = Math.max(0, hurt - dt);

    if (keys.left) aim -= 3.6 * dt;
    if (keys.right) aim += 3.6 * dt;
    if (holding || keys.fire) shoot();

    spawnTimer -= dt * enemySlow();
    if (spawnTimer <= 0) {
      spawnZombie();
      spawnTimer = Math.max(0.3, 1.2 - elapsed * 0.012) * (boss ? 2.5 : 1);
    }

    bullets.forEach((b) => { b.x += b.vx * dt; b.y += b.vy * dt; });
    bullets = bullets.filter((b) => b.x > -10 && b.x < W + 10 && b.y > -10 && b.y < H + 10);

    zombies.forEach((z) => {
      const a = Math.atan2(player.y - z.y, player.x - z.x);
      z.angle = a;
      z.x += Math.cos(a) * z.speed * dt * enemySlow();
      z.y += Math.sin(a) * z.speed * dt * enemySlow();
      z.wobble += dt * 6;
    });

    // Bullets vs zombies
    bullets.forEach((b) => {
      for (const z of zombies) {
        if (z.hp > 0 && Math.hypot(b.x - z.x, b.y - z.y) < z.r + 3) {
          z.hp--;
          b.dead = true;
          burst(b.x, b.y, "#8fd36b", 5);
          if (z.hp <= 0) {
            addScore(z.maxhp * 10);
            burst(z.x, z.y, "#6fae5b", 16);
            updateHud();
          }
          break;
        }
      }
    });
    bullets = bullets.filter((b) => !b.dead);
    zombies = zombies.filter((z) => z.hp > 0);

    // Zombies vs player
    for (const z of zombies) {
      if (cheats.ghost) break;   // ghosts walk straight through zombies
      if (Math.hypot(z.x - player.x, z.y - player.y) < z.r + player.r - 4) {
        z.hp = 0;
        hurtPlayer();
        if (state !== "playing") break;
      }
    }
    zombies = zombies.filter((z) => z.hp > 0);

    updateBoss(dt);
    buffs.tick(dt);
    updatePickups(dt);

    particles.forEach((p) => { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; });
    particles = particles.filter((p) => p.t < p.life);
  }

  function drawZombie(z) {
    ctx.save();
    ctx.translate(z.x, z.y);
    ctx.rotate(z.angle);
    const tough = z.maxhp > 1;
    const sway = Math.sin(z.wobble) * 3;
    // Arms reaching forward
    ctx.fillStyle = tough ? "#4f7d44" : "#5f9a50";
    ctx.fillRect(z.r - 4, -z.r * 0.8 + sway, z.r * 0.9, 5);
    ctx.fillRect(z.r - 4, z.r * 0.8 - 5 - sway, z.r * 0.9, 5);
    // Body
    ctx.beginPath();
    ctx.arc(0, 0, z.r, 0, Math.PI * 2);
    ctx.fillStyle = tough ? "#4a7a40" : "#6fae5b";
    ctx.fill();
    ctx.lineWidth = tough ? 3 : 2;
    ctx.strokeStyle = tough ? "#c9d1ff" : "#3d6a33";
    ctx.stroke();
    // Eyes
    ctx.fillStyle = "#ff3b4d";
    ctx.beginPath(); ctx.arc(z.r * 0.4, -z.r * 0.35, 2.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(z.r * 0.4, z.r * 0.35, 2.8, 0, Math.PI * 2); ctx.fill();
    // Mouth
    ctx.strokeStyle = "#1f3a1a";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(z.r * 0.55, -3); ctx.lineTo(z.r * 0.55, 3); ctx.stroke();
    ctx.restore();
    if (tough && z.hp < z.maxhp) {
      ctx.fillStyle = "#2c2f5c"; ctx.fillRect(z.x - 14, z.y - z.r - 9, 28, 4);
      ctx.fillStyle = "#ff8fa3"; ctx.fillRect(z.x - 14, z.y - z.r - 9, 28 * (z.hp / z.maxhp), 4);
    }
  }

  function drawPlayer() {
    // Gun
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(aim);
    if (cheats.ghost) ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#c9d1ff";
    ctx.fillRect(10, -4, 26, 8);
    ctx.restore();
    ctx.save();
    if (cheats.ghost) ctx.globalAlpha = 0.35;
    drawChar(ctx, player.x, player.y, player.r);
    ctx.restore();
    if (buffs.has("shield")) drawShield(ctx, player.x, player.y, player.r);
    if (hurt > 0) {
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ff5a6e";
      ctx.stroke();
    }
  }

  function overlay(title, lines) {
    ctx.fillStyle = "rgba(10,11,30,.78)";
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center";
    ctx.fillStyle = "#eceeff";
    ctx.font = '700 38px "Bricolage Grotesque", system-ui, sans-serif';
    ctx.fillText(title, W / 2, H / 2 - 20);
    ctx.font = '400 18px "Figtree", system-ui, sans-serif';
    ctx.fillStyle = "#9aa0cf";
    lines.forEach((t, i) => ctx.fillText(t, W / 2, H / 2 + 16 + i * 26));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0d0e24";
    ctx.fillRect(0, 0, W, H);
    // Faint floor grid
    ctx.strokeStyle = "rgba(124,130,200,.07)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    zombies.forEach(drawZombie);
    drawBoss();
    ctx.fillStyle = "#ffd76a";
    bullets.forEach((b) => { ctx.beginPath(); ctx.arc(b.x, b.y, 3.5, 0, Math.PI * 2); ctx.fill(); });
    particles.forEach((p) => {
      ctx.globalAlpha = Math.max(0, 1 - p.t / p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    });
    ctx.globalAlpha = 1;
    pickups.forEach((p) => drawPickup(ctx, p.x, p.y, p.kind, p.life));
    drawPlayer();
    drawBossUi();
    drawBuffChips(ctx, buffs.list());

    if (hurt > 0) {
      ctx.fillStyle = `rgba(255,60,80,${hurt * 0.5})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (state === "idle") {
      overlay("Zombie shooter", ["Press Start. Don't let them reach you.", "A boss shows up every few hundred points.", high ? `Best score: ${high}` : "Kill zombies to score points."]);
    } else if (state === "over") {
      overlay("Game over", [`Score: ${score}`, newBest ? "New best score!" : `Best score: ${high}`]);
    }
  }

  function loop(now) {
    if (state !== "playing") return;
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    update(dt);
    draw();
    if (state === "playing") requestAnimationFrame(loop);
  }

  // ---- Input ----
  function aimAt(e) {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * (W / r.width);
    const y = (e.clientY - r.top) * (H / r.height);
    aim = Math.atan2(y - player.y, x - player.x);
  }
  canvas.addEventListener("pointerdown", (e) => {
    if (state !== "playing") { if (performance.now() - overAt > 600) start(); return; }
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    holding = true;
    aimAt(e);
  });
  canvas.addEventListener("pointermove", (e) => { if (state === "playing") aimAt(e); });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((t) => canvas.addEventListener(t, () => { holding = false; }));

  window.addEventListener("keydown", (e) => {
    if (state !== "playing" || !modal.hidden) return;
    const k = e.key.toLowerCase();
    if (k === "arrowleft" || k === "a") keys.left = true;
    else if (k === "arrowright" || k === "d") keys.right = true;
    else if (k === " ") keys.fire = true;
    else return;
    e.preventDefault();
  });
  window.addEventListener("keyup", (e) => {
    const k = e.key.toLowerCase();
    if (k === "arrowleft" || k === "a") keys.left = false;
    else if (k === "arrowright" || k === "d") keys.right = false;
    else if (k === " ") keys.fire = false;
  });
  window.addEventListener("blur", () => { holding = false; keys.left = keys.right = keys.fire = false; });

  games.shooter = { redraw: draw, onCheat(k, on) { if (k === "allbuff" && on && state === "playing") { lives = Math.max(lives, 5); updateHud(); } }, stop() { if (state === "playing") { quietEnd = true; endGame(); quietEnd = false; draw(); } } };
  startBtn.onclick = start;
  reset();
  draw();
})();

// ============================================================
// Sky jump: the higher you climb, the harder it gets
// ============================================================
(function () {
  const canvas = $("jCanvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const KEY = "jump-highscore";
  const scoreEl = $("jScore"), highEl = $("jHigh"), levelEl = $("jLevel"), startBtn = $("jStart");
  const GRAVITY = 1500, JUMP = 720, R = 17;

  let high = loadHigh(KEY);
  highEl.textContent = high;

  let state = "idle", overAt = 0, lastTime = 0, newBest = false, shown = -1;
  let player = { x: W / 2, y: H - 70, vy: 0 };
  let plats = [], climb = 0, topY = 0, targetX = null;
  const keys = {};
  let extra = 0, pickups = [], pickupT = 0;       // extra = height added by the X2 cheat
  const total = () => climb + extra;
  const buffs = makeBuffs(["rapid", "spread", "shield"]);
  const stars = Array.from({ length: 40 }, () => ({ x: Math.random() * W, y: Math.random() * H, z: 0.3 + Math.random() * 0.7 }));

  // 0 at the start, 1 at 400 m and above
  const difficulty = () => Math.min(1, climb / 4000);
  const levelName = (d) => (d < 0.25 ? "Easy" : d < 0.5 ? "Medium" : d < 0.8 ? "Hard" : "Insane");

  function addPlatform(y) {
    const d = difficulty();
    const w = 86 - 42 * d;                 // platforms shrink with height
    const roll = Math.random();
    let type = "normal";
    if (roll < 0.5 * d) type = "move";     // sliding platforms appear
    else if (roll < 0.78 * d) type = "break"; // crumbling platforms appear
    plats.push({
      x: Math.random() * (W - w), y, w, h: 12, type,
      vx: type === "move" ? (45 + 120 * d) * (Math.random() < 0.5 ? -1 : 1) : 0,
      dead: false, vy: 0,
    });
  }

  function fill() {
    // Gaps widen with height but always stay under the jump height
    while (topY > -30) {
      const d = difficulty();
      topY -= 60 + 72 * d + Math.random() * 14;
      addPlatform(topY);
    }
  }

  function reset() {
    climb = 0; extra = 0; newBest = false; targetX = null; shown = -1;
    pickups = []; pickupT = 0; buffs.clear();
    boss = null; bossCount = 0; nextBossClimb = 1000; shots = []; fireballs = []; lives = 3; invuln = 0; banner.t = 0;
    player = { x: W / 2, y: H - 70, vy: -JUMP };
    plats = [{ x: 0, y: H - 40, w: W, h: 12, type: "normal", vx: 0, dead: false, vy: 0 }];
    topY = H - 40;
    fill();
    updateHud(true);
  }

  function updateHud(force) {
    const h = Math.floor(total() / 10);
    if (!force && h === shown) return;
    shown = h;
    scoreEl.textContent = h + " m";
    highEl.textContent = high + " m";
    levelEl.textContent = boss ? `Boss ${boss.lv + 1} ${tierName(boss.lv)} ` + "♥".repeat(Math.max(0, lives)) : levelName(difficulty());
  }

  function start() {
    if (state === "playing") resetCheats();   // pressing Restart clears every cheat and buff
    reset();
    state = "playing";
    startBtn.blur();   // so Space does not press the button again
    startBtn.textContent = "Restart";
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  function endGame() {
    state = "over";
    buffs.clear();                      // dying clears every buff...
    if (!quietEnd) resetCheats();       // ...and every cheat
    overAt = performance.now();
    const h = Math.floor(total() / 10);
    if (h > high) { high = h; newBest = true; saveHigh(KEY, high); }
    updateHud(true);
    startBtn.textContent = "Play again";
  }

  function update(dt) {
    const prevBottom = player.y + R;

    if (keys.left || keys.right) {
      player.x += ((keys.right ? 1 : 0) - (keys.left ? 1 : 0)) * 400 * dt;
      targetX = null;
    } else if (targetX !== null) {
      const dx = targetX - player.x, step = 620 * dt;
      player.x += Math.abs(dx) <= step ? dx : Math.sign(dx) * step;
    }
    if (player.x < -R) player.x = W + R;      // wrap around the edges
    else if (player.x > W + R) player.x = -R;

    player.vy += GRAVITY * dt;
    player.y += player.vy * dt;

    plats.forEach((p) => {
      if (p.dead) { p.vy += GRAVITY * dt; p.y += p.vy * dt; return; }
      if (p.type === "move") {
        p.x += p.vx * dt;
        if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx); }
        else if (p.x + p.w > W) { p.x = W - p.w; p.vx = -Math.abs(p.vx); }
      }
    });

    // Land on a platform only while falling
    if (player.vy > 0) {
      const bottom = player.y + R;
      for (const p of plats) {
        if (p.dead) continue;
        if (prevBottom <= p.y + 2 && bottom >= p.y && Math.abs(player.x - (p.x + p.w / 2)) < p.w / 2 + R * 0.6) {
          player.y = p.y - R;
          player.vy = -JUMP;
          if (p.type === "break") { p.dead = true; p.vy = 0; }
          break;
        }
      }
    }

    // Camera follows you up
    const line = H * 0.42;
    if (!boss && player.y < line) {
      const dy = line - player.y;
      player.y = line;
      climb += dy;
      if (cheats.x2) extra += dy;
      topY += dy;
      plats.forEach((p) => { p.y += dy; });
    }
    plats = plats.filter((p) => p.y < H + 80);
    if (!boss) fill();
    updateHud(false);
    updateBoss(dt);
    buffs.tick(dt);
    updatePickups(dt);

    if (state === "playing" && player.y - R > H) {
      if (cheats.immortal) {   // immortal: a rescue platform catches you
        plats.push({ x: 0, y: H - 40, w: W, h: 12, type: "normal", vx: 0, dead: false, vy: 0 });
        player.y = H - 40 - R;
        player.vy = -JUMP;
      } else endGame();
    }
  }

  // ---- Boss: a ghost blocks the way every 150 m. Your player shoots by itself. ----
  let boss = null, bossCount = 0, nextBossClimb = 1000, shots = [], fireballs = [], shootT = 0, lives = 3, invuln = 0;
  const banner = { text: "", sub: "", t: 0 };

  function startBoss() {
    // Every boss is tougher than the last: more health, faster, more fireballs
    const lv = bossCount;
    const hp = 14 + 7 * lv;
    boss = { x: W / 2, y: 85, w: 100, h: 76, dir: 1, hp, maxhp: hp, fireT: 1.6, flash: 0, lv };
    // Arena: a bouncy floor and a few platforms, and the camera stops climbing
    plats = [
      { x: 0, y: H - 30, w: W, h: 12, type: "normal", vx: 0, dead: false, vy: 0 },
      { x: 40, y: H - 170, w: 90, h: 12, type: "normal", vx: 0, dead: false, vy: 0 },
      { x: W - 130, y: H - 170, w: 90, h: 12, type: "normal", vx: 0, dead: false, vy: 0 },
      { x: W / 2 - 45, y: H - 300, w: 90, h: 12, type: "normal", vx: 0, dead: false, vy: 0 },
    ];
    shots = []; fireballs = []; shootT = 0; lives = cheats.allbuff ? 5 : 3; invuln = 0;
    pickups = []; pickupT = 1.5;
    banner.text = `BOSS ${lv + 1}`;
    banner.sub = `${tierName(lv)}: you shoot automatically. Line up and dodge.`;
    banner.t = 2.4;
    updateHud(true);
  }

  function defeatBoss() {
    bossCount++;
    climb += 500;   // reward: 50 m
    if (cheats.x2) extra += 500;
    boss = null; shots = []; fireballs = [];
    banner.text = "BOSS DEFEATED";
    banner.sub = cheats.x2 ? "+100 m" : "+50 m";
    banner.t = 2.4;
    nextBossClimb = climb + 1000;   // a new boss every 100 m
    // Start building platforms upward again from the arena
    const ys = plats.filter((p) => !p.dead).map((p) => p.y);
    topY = ys.length ? Math.min(...ys) : 0;
    fill();
    updateHud(true);
  }

  function hitPlayer() {
    if (cheats.immortal || cheats.ghost) return;
    if (buffs.absorb()) { invuln = 0.6; return; }
    lives--;
    invuln = 1.2;
    player.vy = Math.max(player.vy, 200);
    updateHud(true);
    if (lives <= 0) endGame();
  }

  // Boss fights leave glowing orbs floating in the arena
  function updatePickups(dt) {
    if (boss) {
      pickupT -= dt;
      if (pickupT <= 0) {
        pickupT = 5 + Math.random() * 2;
        const kinds = ["rapid", "spread", "shield", "heart"];
        pickups.push({ x: 30 + Math.random() * (W - 60), y: H - 300 + Math.random() * 210, kind: kinds[Math.floor(Math.random() * kinds.length)], life: 10 });
      }
    }
    pickups.forEach((p) => { p.life -= dt; });
    for (const p of pickups) {
      if (Math.hypot(p.x - player.x, p.y - player.y) < R + 14) {
        p.life = 0;
        if (p.kind === "heart") { lives = Math.min(5, lives + 1); updateHud(true); }
        else buffs.give(p.kind);
      }
    }
    pickups = pickups.filter((p) => p.life > 0);
  }

  function updateBoss(dt) {
    banner.t = Math.max(0, banner.t - dt);
    invuln = Math.max(0, invuln - dt);
    if (state !== "playing") return;
    if (!boss) { if (climb >= nextBossClimb) startBoss(); return; }

    const phase2 = boss.hp < boss.maxhp / 2;
    boss.flash = Math.max(0, boss.flash - dt);
    boss.x += boss.dir * Math.min(230, 60 + 22 * boss.lv + (phase2 ? 60 : 0)) * dt * enemySlow();
    if (boss.x < boss.w / 2) { boss.x = boss.w / 2; boss.dir = 1; }
    else if (boss.x > W - boss.w / 2) { boss.x = W - boss.w / 2; boss.dir = -1; }

    // Auto-fire straight up
    shootT -= dt;
    if (shootT <= 0) {
      shootT = buffs.has("rapid") ? 0.12 : 0.28;
      const spread = buffs.has("spread") ? [-90, 0, 90] : [0];
      spread.forEach((vx) => shots.push({ x: player.x, y: player.y - R, vx, vy: -620 }));
    }
    shots.forEach((s) => { s.x += (s.vx || 0) * dt; s.y += s.vy * dt; });
    shots.forEach((s) => {
      if (!s.dead && Math.abs(s.x - boss.x) < boss.w / 2 && Math.abs(s.y - boss.y) < boss.h / 2) {
        s.dead = true;
        boss.hp--;
        boss.flash = 0.12;
      }
    });
    shots = shots.filter((s) => !s.dead && s.y > -20 && s.x > -20 && s.x < W + 20);
    if (boss.hp <= 0) { defeatBoss(); return; }

    // Fireballs aimed at you
    boss.fireT -= dt * enemySlow();
    if (boss.fireT <= 0) {
      const gap = Math.max(0.7, 1.7 - 0.2 * boss.lv);
      boss.fireT = phase2 ? gap * 0.65 : gap;
      const n = Math.min(3, (phase2 ? 2 : 1) + (boss.lv >= 3 ? 1 : 0));
      const a = Math.atan2(player.y - boss.y, player.x - boss.x);
      for (let i = 0; i < n; i++) {
        const ang = a + (i - (n - 1) / 2) * 0.35;
        const fs = Math.min(330, 190 + 18 * boss.lv);
        fireballs.push({ x: boss.x, y: boss.y + 20, vx: Math.cos(ang) * fs, vy: Math.sin(ang) * fs });
      }
    }
    fireballs.forEach((f) => { f.x += f.vx * dt * enemySlow(); f.y += f.vy * dt * enemySlow(); });
    for (const f of fireballs) {
      if (invuln <= 0 && !cheats.ghost && Math.hypot(f.x - player.x, f.y - player.y) < 9 + R - 3) {
        f.dead = true;
        hitPlayer();
        if (state !== "playing") return;
      }
    }
    fireballs = fireballs.filter((f) => !f.dead && f.y < H + 20 && f.x > -20 && f.x < W + 20);

    // Bumping into the boss hurts too
    if (invuln <= 0 && !cheats.ghost && Math.abs(player.x - boss.x) < boss.w / 2 + R - 4 && Math.abs(player.y - boss.y) < boss.h / 2 + R - 4) hitPlayer();
  }

  function drawBossLayer() {
    ctx.fillStyle = "#ffd76a";
    shots.forEach((s) => { ctx.beginPath(); ctx.arc(s.x, s.y, 4, 0, Math.PI * 2); ctx.fill(); });
    fireballs.forEach((f) => {
      ctx.fillStyle = "#ff7a3c";
      ctx.beginPath(); ctx.arc(f.x, f.y, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffd76a";
      ctx.beginPath(); ctx.arc(f.x, f.y, 4, 0, Math.PI * 2); ctx.fill();
    });
    if (!boss) return;
    const x = boss.x, y = boss.y, w = boss.w, h = boss.h;
    const cy = y - h / 2 + w / 2, seg = w / 4;
    ctx.fillStyle = boss.flash > 0 ? "#ffffff" : boss.hp < boss.maxhp / 2 ? "#ff8fa3" : "#b58cff";
    ctx.beginPath();
    ctx.arc(x, cy, w / 2, Math.PI, 0);
    ctx.lineTo(x + w / 2, y + h / 2);
    for (let i = 0; i < 4; i++) {
      ctx.lineTo(x + w / 2 - i * seg - seg / 2, y + h / 2 - 12);
      ctx.lineTo(x + w / 2 - (i + 1) * seg, y + h / 2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ff3b4d";
    ctx.beginPath(); ctx.arc(x - 18, cy - 4, 7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 18, cy - 4, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#1f1340";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 28, cy - 16); ctx.lineTo(x - 10, cy - 10);
    ctx.moveTo(x + 28, cy - 16); ctx.lineTo(x + 10, cy - 10);
    ctx.stroke();
    ctx.fillStyle = "#1f1340";
    ctx.fillRect(x - 14, cy + 12, 28, 10);
  }

  function drawBossUi() {
    if (boss) barOn(ctx, 40, 24, W - 80, 10, boss.hp / boss.maxhp, bossLabel(boss.lv));
    bannerOn(ctx, W, H, banner);
  }

  function drawPlatform(p) {
    ctx.save();
    if (p.dead) ctx.globalAlpha = Math.max(0, 1 - Math.max(0, p.y - H * 0.5) / H);
    ctx.fillStyle = p.type === "move" ? "#f2b84b" : p.type === "break" ? "#ff8fa3" : "#8fc9ff";
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.fillRect(p.x, p.y, p.w, 3);
    if (p.type === "break") {
      ctx.strokeStyle = "rgba(60,10,30,.7)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x + p.w * 0.3, p.y); ctx.lineTo(p.x + p.w * 0.4, p.y + p.h);
      ctx.moveTo(p.x + p.w * 0.7, p.y); ctx.lineTo(p.x + p.w * 0.6, p.y + p.h);
      ctx.stroke();
    }
    ctx.restore();
  }

  function draw() {
    const d = difficulty();
    ctx.fillStyle = `rgb(${Math.round(13 + 34 * d)},${Math.round(14 - 4 * d)},${Math.round(36 + 8 * d)})`;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(214,220,255,.6)";
    stars.forEach((s) => { ctx.fillRect(s.x, (s.y + climb * 0.25 * s.z) % H, 2 * s.z, 2 * s.z); });

    plats.forEach(drawPlatform);
    drawBossLayer();
    pickups.forEach((p) => drawPickup(ctx, p.x, p.y, p.kind, p.life));
    ctx.save();
    if (invuln > 0 && Math.floor(invuln * 10) % 2) ctx.globalAlpha = 0.4;
    else if (cheats.ghost) ctx.globalAlpha = 0.35;
    drawChar(ctx, player.x, player.y, R);
    if (player.x < R) drawChar(ctx, player.x + W, player.y, R);
    if (player.x > W - R) drawChar(ctx, player.x - W, player.y, R);
    ctx.restore();
    if (buffs.has("shield")) drawShield(ctx, player.x, player.y, R);
    drawBossUi();
    drawBuffChips(ctx, buffs.list());

    if (state === "idle") {
      overlayOn(ctx, W, H, "Sky jump", ["Tap Start, then drag left and right.", "Higher means harder.", "A tougher boss every 100 m.", high ? `Best: ${high} m` : ""]);
    } else if (state === "over") {
      overlayOn(ctx, W, H, "Game over", [`Height: ${Math.floor(total() / 10)} m`, newBest ? "New best height!" : `Best: ${high} m`, "Tap to play again"]);
    }
  }

  function loop(now) {
    if (state !== "playing") return;
    const dt = Math.min(0.033, (now - lastTime) / 1000);
    lastTime = now;
    update(dt);
    draw();
    if (state === "playing") requestAnimationFrame(loop);
  }

  // ---- Input: drag a finger (or move the mouse) to steer ----
  function steer(e) { targetX = pointerXY(canvas, e).x; }
  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (state !== "playing") { if (performance.now() - overAt > 600) start(); return; }
    canvas.setPointerCapture(e.pointerId);
    steer(e);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (state === "playing" && (e.pointerType !== "touch" || e.buttons)) steer(e);
  });

  window.addEventListener("keydown", (e) => {
    if (state !== "playing" || !modal.hidden) return;
    const k = e.key.toLowerCase();
    if (k === "arrowleft" || k === "a") keys.left = true;
    else if (k === "arrowright" || k === "d") keys.right = true;
    else return;
    e.preventDefault();
  });
  window.addEventListener("keyup", (e) => {
    const k = e.key.toLowerCase();
    if (k === "arrowleft" || k === "a") keys.left = false;
    else if (k === "arrowright" || k === "d") keys.right = false;
  });
  window.addEventListener("blur", () => { keys.left = keys.right = false; });

  games.jump = { redraw: draw, onCheat(k, on) { if (k === "allbuff" && on && state === "playing" && boss) { lives = Math.max(lives, 5); updateHud(true); } }, stop() { if (state === "playing") { quietEnd = true; endGame(); quietEnd = false; draw(); } } };
  startBtn.onclick = start;
  reset();
  draw();
})();

// ============================================================
// Night run: jump the tombstones, run under the bats
// ============================================================
(function () {
  const canvas = $("rCanvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const KEY = "run-highscore";
  const scoreEl = $("rScore"), highEl = $("rHigh"), startBtn = $("rStart");
  const GROUND = H - 52, R = 18, PX = 92, GRAV = 2300, JUMP = 820;

  let high = loadHigh(KEY);
  highEl.textContent = high;

  let state = "idle", overAt = 0, lastTime = 0, newBest = false, shown = -1;
  let py = GROUND - R, vy = 0, onGround = true, jumpHeld = false, buffer = 0;
  let obstacles = [], distance = 0, elapsed = 0, nextIn = 0;
  let extra = 0, pickups = [], pickupT = 0;       // extra = points added by the X2 cheat
  const buffs = makeBuffs(["shield", "slow", "power"]);
  const stars = Array.from({ length: 30 }, () => ({ x: Math.random() * W, y: Math.random() * (GROUND - 40), z: 0.3 + Math.random() * 0.7 }));

  const speed = () => Math.min(640, 270 + runTime * 7);
  const score = () => Math.floor(distance / 12 + extra) + bonus;

  function reset() {
    py = GROUND - R; vy = 0; onGround = true; jumpHeld = false; buffer = 0;
    obstacles = []; distance = 0; elapsed = 0; nextIn = 500; newBest = false; shown = -1;
    boss = null; bossCount = 0; nextBoss = 500; bonus = 0; runTime = 0; banner.t = 0;
    extra = 0; pickups = []; pickupT = 0; buffs.clear();
    updateHud(true);
  }

  function updateHud(force) {
    const s = score();
    if (!force && s === shown) return;
    shown = s;
    scoreEl.textContent = s;
    highEl.textContent = high;
  }

  function start() {
    if (state === "playing") resetCheats();   // pressing Restart clears every cheat and buff
    reset();
    state = "playing";
    startBtn.blur();   // so Space does not press the button again
    startBtn.textContent = "Restart";
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  function endGame() {
    state = "over";
    buffs.clear();                      // dying clears every buff...
    if (!quietEnd) resetCheats();       // ...and every cheat
    overAt = performance.now();
    jumpHeld = false;
    if (score() > high) { high = score(); newBest = true; saveHigh(KEY, high); }
    updateHud(true);
    startBtn.textContent = "Play again";
  }

  function spawn() {
    const r = Math.random();
    if (elapsed > 10 && r < 0.25) {
      // Bat: fly under it, jumping into it ends the run
      obstacles.push({ type: "bat", x: W + 20, y: GROUND - 72, w: 34, h: 22 });
    } else if (r < 0.62) {
      const h = 28 + Math.random() * 24, w = 20 + Math.random() * 10;
      obstacles.push({ type: "stone", x: W + 20, y: GROUND - h, w, h });
    } else {
      const h = 28 + Math.random() * 18, w = 20 + Math.random() * 6;
      obstacles.push({ type: "stone", x: W + 20, y: GROUND - h, w, h });
      obstacles.push({ type: "stone", x: W + 20 + w + 8, y: GROUND - h, w, h });
    }
  }

  function update(dt) {
    elapsed += dt;
    if (!boss) runTime += dt;
    const sp = speed();
    distance += sp * dt;
    if (cheats.x2) extra += sp * dt / 12;
    buffer -= dt;

    if (buffer > 0 && onGround) { vy = -JUMP; onGround = false; buffer = 0; }
    vy += GRAV * dt;
    py += vy * dt;
    if (!jumpHeld && vy < -450) vy = -450;   // let go early for a short hop
    if (py >= GROUND - R) { py = GROUND - R; vy = 0; onGround = true; } else onGround = false;

    if (!boss) {
      nextIn -= sp * dt;
      if (nextIn <= 0) { spawn(); nextIn = sp * 0.85 + Math.random() * sp * 0.7; }
      if (score() >= nextBoss) startBoss();
    }
    updateBoss(dt);
    buffs.tick(dt);
    updatePickups(dt, sp);

    const slow = (buffs.has("slow") ? 0.6 : 1) * enemySlow();
    obstacles.forEach((o) => { o.x -= (sp * (o.mul || 1) + (o.type === "bat" ? 70 : 0)) * slow * dt; });
    obstacles = obstacles.filter((o) => o.x + o.w > -20 && !o.dead);

    // Ghost and immortal pass straight through everything
    if (!cheats.ghost && !cheats.immortal) {
      const pl = { l: PX - 12, r: PX + 12, t: py - 15, b: py + 17 };
      for (const o of obstacles) {
        if (o.dead) continue;
        if (pl.r > o.x + 3 && pl.l < o.x + o.w - 3 && pl.b > o.y + 3 && pl.t < o.y + o.h - 3) {
          if (buffs.absorb()) {   // the shield breaks the obstacle (a boss throw still counts as dodged)
            o.dead = true;
            if (o.boss && !o.counted) { o.counted = true; hitBoss(); }
            continue;
          }
          endGame();
          break;
        }
      }
    }
    updateHud(false);
  }

  // ---- Boss: a giant zombie throws things. Every attack you dodge wears it down. ----
  let boss = null, bossCount = 0, nextBoss = 500, bonus = 0, runTime = 0;
  const banner = { text: "", sub: "", t: 0 };

  function startBoss() {
    // Every boss is tougher than the last: more health, faster and more frequent throws
    const lv = bossCount;
    const hp = Math.min(16, 5 + 2 * lv);
    boss = { x: W + 100, hp, maxhp: hp, attackT: 0.5, flash: 0, recoil: 0, leaving: false, lv };
    banner.text = `BOSS ${lv + 1}`;
    banner.sub = `${tierName(lv)}: dodge its attacks to wear it down`;
    banner.t = 2.4;
    pickupT = 1.2;
  }

  function hitBoss() {
    if (!boss || boss.leaving) return;
    boss.hp -= buffs.has("power") ? 2 : 1;
    boss.flash = 0.15;
    if (boss.hp <= 0) defeatBoss();
  }

  // Boss fights send glowing orbs along the ground: run into the low ones, jump for the high ones
  function updatePickups(dt, sp) {
    if (boss && !boss.leaving) {
      pickupT -= dt;
      if (pickupT <= 0) {
        pickupT = 4 + Math.random() * 2;
        const kinds = ["shield", "slow", "power"];
        pickups.push({ x: W + 20, y: Math.random() < 0.5 ? GROUND - 34 : GROUND - 120, kind: kinds[Math.floor(Math.random() * kinds.length)] });
      }
    }
    pickups.forEach((p) => { p.x -= sp * dt; });
    for (const p of pickups) {
      if (Math.hypot(p.x - PX, p.y - py) < 34) { p.got = true; buffs.give(p.kind); }
    }
    pickups = pickups.filter((p) => !p.got && p.x > -20);
  }

  function defeatBoss() {
    const award = (150 + 50 * bossCount) * mult();
    bonus += award;
    bossCount++;
    boss.leaving = true;
    banner.text = "BOSS DEFEATED";
    banner.sub = `+${award} points`;
    banner.t = 2.4;
    nextBoss = score() + 500;
    updateHud(true);
  }

  function attack() {
    const x = boss.x - 50;
    const m = 1 + Math.min(0.45, 0.06 * boss.lv);       // later bosses throw faster
    const dbl = Math.min(0.3, 0.04 + 0.05 * boss.lv);    // and throw doubles more often
    const r = Math.random();
    boss.recoil = 0.25;
    if (r < dbl) {
      obstacles.push({ type: "boulder", boss: true, mul: 1.15 * m, x, y: GROUND - 34, w: 34, h: 34 });
      obstacles.push({ type: "boulder", boss: true, mul: 1.15 * m, x: x + 48, y: GROUND - 34, w: 34, h: 34 });
      return;
    }
    const q = (r - dbl) / (1 - dbl);
    if (q < 0.33) obstacles.push({ type: "boulder", boss: true, mul: 1.15 * m, x, y: GROUND - 34, w: 34, h: 34 });
    else if (q < 0.55) obstacles.push({ type: "boulder", boss: true, mul: 1.1 * m, x, y: GROUND - 52, w: 52, h: 52 });
    else if (q < 0.8) obstacles.push({ type: "skull", boss: true, mul: 1.2 * m, x, y: GROUND - 50, w: 26, h: 26 });   // too low to run under
    else obstacles.push({ type: "bat", boss: true, mul: m, x, y: GROUND - 72, w: 34, h: 22 });                         // run under it
  }

  function updateBoss(dt) {
    banner.t = Math.max(0, banner.t - dt);
    if (!boss) return;
    boss.flash = Math.max(0, boss.flash - dt);
    boss.recoil = Math.max(0, boss.recoil - dt);
    if (boss.leaving) {
      boss.x += 240 * dt;
      if (boss.x > W + 140) { boss = null; nextIn = speed() * 1.2; }
      return;
    }
    if (boss.x > W - 74) {
      boss.x = Math.max(W - 74, boss.x - 170 * dt);   // slides in from the right
    } else {
      boss.attackT -= dt * enemySlow();
      if (boss.attackT <= 0) {
        attack();
        boss.attackT = Math.max(0.75, 1.7 - 0.14 * boss.lv) + Math.random() * 0.45;
      }
    }
    for (const o of obstacles) {
      if (o.boss && !o.counted && o.x + o.w < PX - 14) {
        o.counted = true;
        hitBoss();
        if (boss.leaving) break;
      }
    }
  }

  function drawBoss() {
    if (!boss) return;
    const r = 50, x = boss.x + (boss.recoil > 0 ? 8 : 0), y = GROUND - r;
    ctx.fillStyle = "#4f7d44";
    ctx.fillRect(x - r - 24, y - 8 + (boss.recoil > 0 ? -10 : 0), 34, 10);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = boss.flash > 0 ? "#e9ffd8" : boss.leaving ? "#3d5f36" : "#5c8f3c";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ffd76a";
    ctx.stroke();
    ctx.fillStyle = "#ff3b4d";
    ctx.beginPath(); ctx.arc(x - 26, y - 14, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x - 6, y - 14, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1f3a1a";
    ctx.fillRect(x - 32, y + 10, 30, 12);
    ctx.fillStyle = "#eceeff";
    ctx.fillRect(x - 28, y + 10, 5, 5);
    ctx.fillRect(x - 18, y + 10, 5, 5);
    ctx.fillRect(x - 8, y + 10, 5, 5);
  }

  function drawBossUi() {
    if (boss && !boss.leaving) barOn(ctx, 140, 24, W - 280, 10, boss.hp / boss.maxhp, bossLabel(boss.lv));
    bannerOn(ctx, W, H, banner);
  }

  function drawObstacle(o) {
    if (o.type === "boulder") {
      const cx = o.x + o.w / 2, cy = o.y + o.h / 2, rad = o.w / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-o.x / rad);
      ctx.fillStyle = "#8a6f5a";
      ctx.beginPath(); ctx.arc(0, 0, rad, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#4b3a2d";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-rad * 0.6, 0); ctx.lineTo(rad * 0.2, -rad * 0.3); ctx.lineTo(rad * 0.5, rad * 0.4); ctx.stroke();
      ctx.restore();
      return;
    }
    if (o.type === "skull") {
      const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
      ctx.fillStyle = "#eceeff";
      ctx.beginPath(); ctx.arc(cx, cy - 1, o.w / 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#14152e";
      ctx.beginPath(); ctx.arc(cx - 5, cy - 2, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 5, cy - 2, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(cx - 4, cy + 6, 8, 5);
      return;
    }
    if (o.type === "bat") {
      const flap = Math.sin(elapsed * 16) * 9;
      ctx.fillStyle = "#b58cff";
      ctx.beginPath(); ctx.ellipse(o.x + o.w / 2, o.y + o.h / 2, 11, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(o.x + 12, o.y + 10); ctx.lineTo(o.x - 2, o.y + 10 - flap); ctx.lineTo(o.x + 10, o.y + 18);
      ctx.moveTo(o.x + o.w - 12, o.y + 10); ctx.lineTo(o.x + o.w + 2, o.y + 10 - flap); ctx.lineTo(o.x + o.w - 10, o.y + 18);
      ctx.fill();
      ctx.fillStyle = "#ff3b4d";
      ctx.fillRect(o.x + o.w / 2 - 5, o.y + 7, 3, 3);
      ctx.fillRect(o.x + o.w / 2 + 2, o.y + 7, 3, 3);
    } else {
      ctx.fillStyle = "#8c93c8";
      ctx.fillRect(o.x, o.y + o.w / 2, o.w, o.h - o.w / 2);
      ctx.beginPath(); ctx.arc(o.x + o.w / 2, o.y + o.w / 2, o.w / 2, Math.PI, 0); ctx.fill();
      ctx.fillStyle = "#4a4f86";
      ctx.fillRect(o.x + o.w / 2 - 1, o.y + 8, 2, 10);
      ctx.fillRect(o.x + o.w / 2 - 4, o.y + 11, 8, 2);
    }
  }

  function draw() {
    ctx.fillStyle = "#0d0e24";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(214,220,255,.6)";
    stars.forEach((s) => {
      const x = ((s.x - distance * 0.03 * s.z) % W + W) % W;
      ctx.fillRect(x, s.y, 2 * s.z, 2 * s.z);
    });
    ctx.fillStyle = "#d6dcff";
    ctx.beginPath(); ctx.arc(540, 58, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#0d0e24";
    ctx.beginPath(); ctx.arc(550, 52, 20, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#14152e";
    ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.fillStyle = "#2c2f5c";
    ctx.fillRect(0, GROUND, W, 3);
    for (let x = -(distance % 48); x < W; x += 48) ctx.fillRect(x, GROUND + 16, 18, 2);

    obstacles.forEach(drawObstacle);
    pickups.forEach((p) => drawPickup(ctx, p.x, p.y, p.kind));
    drawBoss();

    // Runner: your photo with two little feet
    ctx.save();
    if (cheats.ghost) ctx.globalAlpha = 0.35;
    const bob = onGround ? -Math.abs(Math.sin(distance / 16)) * 3 : 0;
    if (onGround) {
      const swing = Math.sin(distance / 12) * 6;
      ctx.fillStyle = "#c9d1ff";
      ctx.fillRect(PX - 8 + swing, py + R - 2, 8, 4);
      ctx.fillRect(PX + 2 - swing, py + R - 2, 8, 4);
    }
    drawChar(ctx, PX, py + bob, R);
    ctx.restore();
    if (buffs.has("shield")) drawShield(ctx, PX, py + bob, R);
    drawBossUi();
    drawBuffChips(ctx, buffs.list());

    if (state === "idle") {
      overlayOn(ctx, W, H, "Night run", ["Tap to jump, hold to jump higher.", "Jump the tombstones. Don't jump into the bats.", "A tougher boss every 500 points.", high ? `Best: ${high}` : ""]);
    } else if (state === "over") {
      overlayOn(ctx, W, H, "Game over", [`Score: ${score()}`, newBest ? "New best score!" : `Best: ${high}`, "Tap to run again"]);
    }
  }

  function loop(now) {
    if (state !== "playing") return;
    const dt = Math.min(0.033, (now - lastTime) / 1000);
    lastTime = now;
    update(dt);
    draw();
    if (state === "playing") requestAnimationFrame(loop);
  }

  // ---- Input: tap or hold anywhere on the game ----
  function press() { jumpHeld = true; buffer = 0.12; }
  function release() { jumpHeld = false; }
  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (state !== "playing") { if (performance.now() - overAt > 600) start(); return; }
    canvas.setPointerCapture(e.pointerId);
    press();
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((t) => canvas.addEventListener(t, release));

  const isJumpKey = (k) => k === " " || k === "arrowup" || k === "w";
  window.addEventListener("keydown", (e) => {
    if (state !== "playing" || !modal.hidden) return;
    if (!isJumpKey(e.key.toLowerCase())) return;
    e.preventDefault();
    if (!e.repeat) press();
  });
  window.addEventListener("keyup", (e) => { if (isJumpKey(e.key.toLowerCase())) release(); });
  window.addEventListener("blur", release);

  games.run = { redraw: draw, stop() { if (state === "playing") { quietEnd = true; endGame(); quietEnd = false; draw(); } } };
  startBtn.onclick = start;
  reset();
  draw();
})();

// ============================================================
// Game picker: switch between the three games
// ============================================================
const gameTabs = document.querySelectorAll("[data-game]");
function showGame(name) {
  Object.keys(games).forEach((k) => { if (k !== name) games[k].stop(); });
  gameTabs.forEach((t) => t.setAttribute("aria-pressed", String(t.dataset.game === name)));
  document.querySelectorAll("[data-panel]").forEach((p) => { p.hidden = p.dataset.panel !== name; });
}
gameTabs.forEach((t) => t.addEventListener("click", () => showGame(t.dataset.game)));
showGame("shooter");

// ============================================================
// Player picker: YUKKI or PRINCE (saved in this browser)
// ============================================================
(function () {
  const box = $("chars");
  const buttons = [];

  function select(i) {
    charIndex = i;
    try { localStorage.setItem("character", String(i)); } catch (e) {}
    buttons.forEach((b, j) => b.setAttribute("aria-pressed", String(j === i)));
    redrawGames();
  }

  CONFIG.characters.forEach((c, i) => {
    const b = document.createElement("button");
    b.className = "char";
    b.setAttribute("aria-pressed", String(i === charIndex));

    const face = document.createElement("span");
    face.className = "face";
    face.style.setProperty("--ring", c.color);
    const img = document.createElement("img");
    img.alt = "";
    const pos = `${c.focus.x * 100}% ${c.focus.y * 100}%`;
    img.style.objectPosition = pos;
    img.style.transformOrigin = pos;
    img.onerror = () => { img.hidden = true; face.style.background = c.color; };
    img.src = c.photo;
    face.append(img);

    const text = document.createElement("span");
    const name = document.createElement("strong");
    name.textContent = c.name;
    const color = document.createElement("small");
    color.textContent = c.colorName;
    text.append(name, color);

    b.append(face, text);
    b.onclick = () => {
      select(i);                        // the games read the choice every frame, so it changes mid-game
      b.blur();                         // keep keyboard focus off the button so Space / Enter go to the game
      showToast(`Playing as ${c.name}`);
    };
    box.append(b);
    buttons.push(b);
  });
})();
