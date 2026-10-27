"use strict";
/* MCQ Practice: fully offline. Data lives in localStorage on the device.
   Runs in any browser (Termux test) and packs into an APK with Capacitor. */

const KEY = "mcq.v1", L = "ABCDEF";
const PAL = ["var(--lav)", "var(--mint)", "var(--peach)", "var(--sky)", "var(--butter)", "var(--pink)"];
const ICON = {
  home: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  book: "M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h13",
  bank: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6",
  redo: "M3 12a9 9 0 1 0 3-6.7M3 4v5h5", chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  back: "M15 5l-7 7 7 7", more: "M12 5v.01M12 12v.01M12 19v.01", close: "M6 6l12 12M18 6L6 18", ok: "M5 12l5 5 9-10",
};
const root = document.getElementById("app");
const THEME_KEY = "mcq.theme";
const THEMES = ["light", "dracula", "nord", "tokyo", "catppuccin", "gruvbox"];
const THEME_LABELS = {light: "Pastel", dracula: "Dracula", nord: "Nord", tokyo: "Tokyo Night", catppuccin: "Catppuccin", gruvbox: "Gruvbox"};
const THEME_ICONS = {light: "sun", dracula: "moon", nord: "snowflake", tokyo: "stars", catppuccin: "cat", gruvbox: "mountain"};
function themeIcon(theme) {
  const paths = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
    moon: '<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
    snowflake: '<path d="M12 2v20M4 6l16 12M20 6 4 18M9 5l3 3 3-3M9 19l3-3 3 3"/>',
    stars: '<path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2ZM19 17l.7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17Z"/>',
    cat: '<path d="M4 10V4l4 3a9 9 0 0 1 8 0l4-3v6a8 8 0 0 1-16 0ZM9 13h.01M15 13h.01M10 17q2 2 4 0"/>',
    mountain: '<path d="m2 20 7-12 4 6 3-4 6 10H2ZM9 8l2-4 3 6"/>'
  };
  const span = document.createElement("span");
  span.className = "theme-icon";
  span.setAttribute("aria-hidden", "true");
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[THEME_ICONS[theme]]}</svg>`;
  return span;
}
let themeChoice = (() => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return THEMES.includes(saved) ? saved : (saved === "dark" ? "dracula" : "system");
  } catch { return "system"; }
})();
const systemDark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
function activeTheme() {
  return themeChoice === "system" ? (systemDark && systemDark.matches ? "dracula" : "light") : themeChoice;
}
function applyTheme() {
  const theme = activeTheme();
  document.documentElement.dataset.theme = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.palette = theme;
  const colors = {light: "#F6F3FB", dracula: "#282A36", nord: "#2E3440", tokyo: "#1A1B26", catppuccin: "#1E1E2E", gruvbox: "#282828"};
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", colors[theme]);
}
function toggleTheme() {
  const current = activeTheme();
  themeChoice = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
  try { localStorage.setItem(THEME_KEY, themeChoice); } catch {}
  applyTheme(); render();
}
applyTheme();
if (systemDark) {
  if (systemDark.addEventListener) systemDark.addEventListener("change", () => { if (themeChoice === "system") { applyTheme(); render(); } });
  else if (systemDark.addListener) systemDark.addListener(() => { if (themeChoice === "system") { applyTheme(); render(); } });
}


/* ---------- small helpers ---------- */
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const pad = (n) => String(n).padStart(2, "0");
const dkey = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const today = () => dkey(new Date());
const fmt = (s) => Math.floor(s / 60) + ":" + pad(s % 60);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function shuffle(a) {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function h(tag, props, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === "class") e.className = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else if (k === "value") e.value = v;
    else if (v === true) e.setAttribute(k, "");
    else e.setAttribute(k, v);
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(String(k)));
  return e;
}
function svg(d, sw = 2, size = 24) {
  const w = document.createElement("span");
  w.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
  return w.firstChild;
}
function rich(s, tag = "div") {
  const el = document.createElement(tag);
  const parts = esc(s).split(/(```[\s\S]*?```)/);
  el.innerHTML = parts.map((p) => p.startsWith("```") && p.endsWith("```") && p.length >= 6
    ? "<pre><code>" + p.slice(3, -3).replace(/^[a-z]*\n/, "") + "</code></pre>"
    : p.replace(/`([^`\n]+)`/g, "<code>$1</code>").replace(/\n/g, "<br>")).join("");
  el.setAttribute("dir", "auto");
  return el;
}
const MATH = { delimiters: [{ left: "$$", right: "$$", display: true }, { left: "\\[", right: "\\]", display: true },
  { left: "\\(", right: "\\)", display: false }, { left: "$", right: "$", display: false }], throwOnError: false };
function typeset(el) { try { if (window.renderMathInElement) renderMathInElement(el || root, MATH); } catch (e) { /* ignore */ } }
function toast(msg) {
  const t = h("div", { class: "toast", role: "status" }, msg);
  document.body.append(t);
  setTimeout(() => t.remove(), 3000);
}
function sheet(title, acts) {
  const bg = h("div", { class: "sheet-bg", onclick: (e) => { if (e.target === bg) bg.remove(); } },
    h("div", { class: "sheet", role: "dialog", "aria-label": title }, h("h3", {}, title),
      acts.filter(Boolean).map(([l, f, d]) => h("button", { class: "btn" + (d ? " danger" : ""), type: "button", onclick: () => { bg.remove(); f(); } }, l)),
      h("button", { class: "btn", type: "button", onclick: () => bg.remove() }, "Cancel")));
  document.body.append(bg);
}
function pickFile(accept, cb) {
  const i = document.createElement("input");
  i.type = "file"; i.accept = accept;
  i.onchange = () => { if (i.files[0]) cb(i.files[0]); };
  i.click();
}
function readFile(f, cb) { const r = new FileReader(); r.onload = () => cb(String(r.result)); r.readAsText(f); }
async function saveFile(name, text, mime) {
  const P = window.Capacitor && window.Capacitor.Plugins;
  if (P && P.Filesystem && P.Share) {
    try {
      const r = await P.Filesystem.writeFile({ path: name, data: text, directory: "CACHE", encoding: "utf8" });
      await P.Share.share({ title: name, url: r.uri });
      return;
    } catch (e) { console.warn(e); }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: mime }));
  a.download = name;
  document.body.append(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

/* ---------- data ---------- */
function blank() {
  return { subjects: [], questions: [], wrong: {}, stats: {}, history: [], daily: {}, goal: 20,
    prefs: { on: {}, counts: {}, timer: "none", minutes: 60, feedback: "end", shuffleO: false } };
}
function seed() {
  const d = blank();
  ["Computer Science", "Physics", "Math", "English"].forEach((n) => d.subjects.push({ id: uid(), name: n, chapters: [] }));
  return d;
}
let db = (function () {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && Array.isArray(d.subjects)) { const b = blank(); return Object.assign(b, d, { prefs: Object.assign(b.prefs, d.prefs || {}) }); }
  } catch (e) { /* fall through */ }
  return seed();
})();
function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { toast("Could not save: storage is full."); } }
const subj = (id) => db.subjects.find((s) => s.id === id);
const subjIdx = (id) => db.subjects.findIndex((s) => s.id === id);
const qsOf = (sid, cid) => db.questions.filter((q) => q.sid === sid && (cid === undefined || (q.cid || "") === cid));
const chName = (s, cid) => (s.chapters.find((c) => c.id === cid) || {}).name || "Unsorted";
function acc(sid) {
  let seen = 0, wr = 0;
  db.questions.forEach((q) => { if (q.sid === sid && db.stats[q.id]) { seen += db.stats[q.id].seen; wr += db.stats[q.id].wrong; } });
  return seen ? Math.round(100 * (1 - wr / seen)) : null;
}
function streak() {
  const d = new Date();
  if (!db.daily[dkey(d)]) d.setDate(d.getDate() - 1);
  let n = 0;
  while (db.daily[dkey(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function record(q, ok, defer) {
  const s = db.stats[q.id] || (db.stats[q.id] = { seen: 0, wrong: 0 });
  s.seen++;
  if (ok) delete db.wrong[q.id];
  else { s.wrong++; db.wrong[q.id] = { n: ((db.wrong[q.id] || {}).n || 0) + 1, last: today() }; }
  db.daily[today()] = (db.daily[today()] || 0) + 1;
  if (!defer) save();
}
function dropQuestions(ids) {
  const set = new Set(ids);
  db.questions = db.questions.filter((q) => !set.has(q.id));
  ids.forEach((id) => { delete db.wrong[id]; delete db.stats[id]; });
}

/* ---------- CSV ---------- */
function csvRows(t) {
  t = t.replace(/^\uFEFF/, "");
  const rows = []; let r = [], f = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { r.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && t[i + 1] === "\n") i++; r.push(f); f = ""; rows.push(r); r = []; }
    else f += c;
  }
  if (f !== "" || r.length) { r.push(f); rows.push(r); }
  return rows.filter((x) => x.some((y) => y.trim() !== ""));
}
function parseCSV(text) {
  const rows = csvRows(text);
  if (rows.length < 2) return { error: "The CSV file is empty." };
  const head = rows[0].map((x) => x.trim().toLowerCase().replace(/\s+/g, "_"));
  const col = (...names) => head.findIndex((x) => names.includes(x));
  const qi = col("question", "questions", "q"), ai = col("answer", "correct", "correct_answer", "correct_option", "ans");
  const ei = col("explanation", "explain", "note", "notes"), ci = col("chapter", "topic"), ti = col("type");
  if (qi < 0 || ai < 0) return { error: "CSV needs a 'question' column and an 'answer' column." };
  const optCols = [];
  head.forEach((x, i) => { const m = /^(?:option|opt|choice)?_?([a-f]|[1-6])$/.exec(x); if (m) optCols.push([/[a-f]/.test(m[1]) ? m[1].charCodeAt(0) - 97 : +m[1] - 1, i]); });
  optCols.sort((a, b) => a[0] - b[0]);
  if (optCols.length < 2) return { error: "Need at least two option columns (option_a, option_b, ...)." };
  const out = []; let skipped = 0;
  for (const r of rows.slice(1)) {
    const q = (r[qi] || "").trim(), raw = (r[ai] || "").trim();
    const pairs = optCols.map(([o, i]) => [o, (r[i] || "").trim()]).filter((p) => p[1]);
    const type = ti >= 0 ? (r[ti] || "").trim().toLowerCase() : "";
    if (!q || pairs.length < 2 || !raw || type === "card" || type === "flashcard") { skipped++; continue; }
    const low = raw.toLowerCase();
    let origIdx = null;
    if (low.length === 1 && low >= "a" && low <= "f") origIdx = low.charCodeAt(0) - 97;
    else if (/^[1-6]$/.test(low)) origIdx = +low - 1;
    let ans = origIdx !== null ? pairs.findIndex((p) => p[0] === origIdx) : -1;
    if (ans < 0) ans = pairs.findIndex((p) => p[1].toLowerCase() === low);
    if (ans < 0) { skipped++; continue; }
    out.push({ q, opts: pairs.map((p) => p[1]), ans, exp: ei >= 0 ? (r[ei] || "").trim() : "", chapter: ci >= 0 ? (r[ci] || "").trim() : "" });
  }
  return { rows: out, skipped };
}
function importText(text, sid, cid) {
  const res = parseCSV(text);
  if (res.error) { toast(res.error); return; }
  const s = subj(sid), have = new Set(qsOf(sid).map((q) => q.q));
  let added = 0, dup = 0;
  for (const r of res.rows) {
    if (have.has(r.q)) { dup++; continue; }
    let c = cid || "";
    if (r.chapter) {
      let ch = s.chapters.find((x) => x.name.toLowerCase() === r.chapter.toLowerCase());
      if (!ch) { ch = { id: uid(), name: r.chapter }; s.chapters.push(ch); }
      c = ch.id;
    }
    db.questions.push({ id: uid(), sid, cid: c, q: r.q, opts: r.opts, ans: r.ans, exp: r.exp });
    have.add(r.q); added++;
  }
  save();
  toast(`Imported ${added} question${added === 1 ? "" : "s"}` + (res.skipped ? `, ${res.skipped} skipped` : "") + (dup ? `, ${dup} duplicates` : ""));
  render();
}
const SAMPLE = [
  ["Computer Science", "Basics", "What does `int(3.9)` return?", ["4", "3", "3.9", "Error"], 1, "int() cuts off the decimal part."],
  ["Computer Science", "Basics", "What is the type of `5/3` in Python?", ["int", "float", "str", "bool"], 1, "The / operator always gives a float."],
  ["Computer Science", "Basics", "Which operator has the highest precedence?", ["+", "*", "**", "%"], 2, ""],
  ["Math", "Calculus", "What is $\\frac{d}{dx}\\sin x$?", ["$\\cos x$", "$-\\cos x$", "$\\sin x$", "$-\\sin x$"], 0, "The derivative of sine is cosine."],
  ["Math", "Calculus", "What is $\\int 2x\\,dx$?", ["$x^2+C$", "$2x^2+C$", "$x+C$", "$2+C$"], 0, "Power rule."],
  ["Math", "Algebra", "What are the roots of $x^2-5x+6=0$?", ["2 and 3", "1 and 6", "-2 and -3", "5 and 1"], 0, "Factor as $(x-2)(x-3)$."],
  ["Physics", "Mechanics", "What is the SI unit of force?", ["Joule", "Watt", "Newton", "Pascal"], 2, "1 N = 1 kg m/s^2."],
  ["Physics", "Mechanics", "Which quantity is a vector?", ["Speed", "Mass", "Velocity", "Time"], 2, "Velocity has magnitude and direction."],
  ["English", "Grammar", "Choose the correct sentence.", ["She don't like tea.", "She doesn't like tea.", "She not like tea.", "She no like tea."], 1, ""],
  ["English", "Vocabulary", "Synonym of 'rapid':", ["Slow", "Quick", "Heavy", "Quiet"], 1, ""],
];
function loadSample() {
  for (const [sn, cn, q, opts, ans, exp] of SAMPLE) {
    let s = db.subjects.find((x) => x.name === sn);
    if (!s) { s = { id: uid(), name: sn, chapters: [] }; db.subjects.push(s); }
    let c = s.chapters.find((x) => x.name === cn);
    if (!c) { c = { id: uid(), name: cn }; s.chapters.push(c); }
    if (!qsOf(s.id).some((x) => x.q === q)) db.questions.push({ id: uid(), sid: s.id, cid: c.id, q, opts, ans, exp });
  }
  save(); toast("Sample questions added"); render();
}

/* ---------- router ---------- */
let stack = [{ v: "home", p: {} }], T = null, RES = null;
let pendingPageTransition = false;
const TAB = { home: "home", subjects: "subjects", bank: "bank", subjectBank: "bank", chapterView: "bank", mistakes: "mistakes", progress: "progress" };
function go(v, p = {}, replace = false) {
  pendingPageTransition = v !== stack[stack.length - 1].v;
  if (replace) stack[stack.length - 1] = { v, p };
  else { stack.push({ v, p }); history.pushState({ n: stack.length }, ""); }
  render();
}
function back() { if (stack.length > 1) history.back(); else go("home", {}, true); }
window.addEventListener("popstate", () => {
  const cur = stack[stack.length - 1];
  if (cur.v === "test" && T && !T.done && !confirm("Exit this test? Your progress will be lost.")) { history.pushState({}, ""); return; }
  if (cur.v === "test") stopTimer();
  if (stack.length > 1) { stack.pop(); pendingPageTransition = true; render(); }
});
function render() {
  const { v, p } = stack[stack.length - 1];
  try { VIEWS[v](p); } catch (e) { console.error(e); root.textContent = "Something went wrong: " + e.message; }
}
function show(nodes, o = {}) {
  root.classList.toggle("nonav", !o.nav);
  const inQuiz = stack[stack.length - 1]?.v === "test";
  root.classList.toggle("quiz-static", inQuiz);
  if (inQuiz) root.classList.remove("page-enter");
  const incoming = [].concat(nodes).flat(Infinity).filter(Boolean);
  // Answer taps must not destroy and recreate the question card: doing so
  // causes a visible flash in Android WebView, especially with KaTeX content.
  if (o.preserveQuestion) {
    const previousCard = root.querySelector('.qcard');
    const nextCard = incoming.find(el => el?.classList?.contains('qcard'));
    if (previousCard && nextCard) {
      const oldOptions = previousCard.querySelectorAll('.opt');
      const newOptions = nextCard.querySelectorAll('.opt');
      if (oldOptions.length === newOptions.length) {
        oldOptions.forEach((button, i) => {
          const next = newOptions[i];
          button.className = next.className;
          button.disabled = next.disabled;
          const oldMark = button.querySelector('.mk');
          if (oldMark) oldMark.remove();
          const newMark = next.querySelector('.mk');
          if (newMark) button.appendChild(newMark);
        });
        // Answer tap: retain the header, progress bar, question and footer.
        // Replacing the entire root was flashing even when the card was reused.
        const oldChildren = Array.from(root.children);
        const oldCardIndex = oldChildren.indexOf(previousCard);
        const nextCardIndex = incoming.indexOf(nextCard);
        if (oldCardIndex === nextCardIndex && oldCardIndex >= 0) {
          // Keep the original timer node and its interval updates alive.
          if (T && T.timerEl) {
            const liveTimer = root.querySelector('.timer');
            if (liveTimer) T.timerEl = liveTimer;
          }
          // Only the explanation and navigation buttons can change on an answer.
          const tail = incoming.slice(nextCardIndex + 1);
          const existingTail = oldChildren.slice(oldCardIndex + 1);
          existingTail.forEach(node => node.remove());
          previousCard.after(...tail);
          if (o.scroll !== false) window.scrollTo(0, 0);
          // Math rendering only for the newly inserted explanation, not the page.
          tail.forEach(node => typeset(node));
          return;
        }
        incoming[incoming.indexOf(nextCard)] = previousCard;
      }
    }
  }
  root.replaceChildren(...incoming, ...(o.nav ? [nav(o.nav)] : []));
  // Animate only screen changes, never answer selections or timer updates.
  if (pendingPageTransition && !inQuiz) {
    pendingPageTransition = false;
    root.classList.remove("page-enter");
    void root.offsetWidth;
    root.classList.add("page-enter");
  }
  if (inQuiz) pendingPageTransition = false;
  if (o.scroll !== false) window.scrollTo(0, 0);
  typeset();
}
function nav(active) {
  const tabs = [["home", "Home", ICON.home], ["subjects", "Subjects", ICON.book], ["bank", "Bank", ICON.bank], ["mistakes", "Mistakes", ICON.redo], ["progress", "Progress", ICON.chart]];
  return h("nav", { class: "nav", "aria-label": "Main" }, tabs.map(([v, t, ic]) =>
    h("button", { class: v === active ? "on" : "", type: "button", onclick: () => go(v, {}, true) }, svg(ic), t)));
}
const topbar = (title, more) => h("div", { class: "top" },
  h("button", { class: "ic", type: "button", "aria-label": "Back", onclick: back }, svg(ICON.back, 2.2)), h("h1", { dir: "auto" }, title),
  more ? h("button", { class: "ic", type: "button", "aria-label": "More options", onclick: more }, svg(ICON.more, 3)) : null);

/* ---------- home ---------- */
function home() {
  const n = db.daily[today()] || 0, goal = db.goal, st = streak(), m = Object.keys(db.wrong).filter((id) => db.questions.some((q) => q.id === id)).length;
  const withQ = db.subjects.filter((s) => qsOf(s.id).length);
  const hr = new Date().getHours(), greet = hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
  const card = (bg, title, text, extra, btn) => h("section", { class: "card", style: "background:var(--" + bg + ")" }, h("h2", {}, title), h("p", { class: "sub" }, text), extra, btn);
  show([
    h("div", { class: "row sp" },
      h("div", {}, h("p", { class: "mu" }, greet), h("h1", {}, "Ready to practise?")),
      h("button", { class: "theme-toggle", type: "button", "aria-label": "Change color theme, current: " + THEME_LABELS[activeTheme()], title: "Switch theme", onclick: toggleTheme },
        themeIcon(activeTheme()), h("span", {}, THEME_LABELS[activeTheme()]))),
    h("section", { class: "card", style: "background:var(--lav);gap:8px" },
      h("div", { class: "row sp" }, h("h2", { class: "sm" }, `Today: ${n} of ${goal} questions`), h("span", { class: "chip streak-chip" }, h("span", { class: "streak-icon", "aria-hidden": "true" }, "🔥"), st ? st + " day streak" : "No streak yet")),
      h("div", { class: "meter" }, h("i", { style: `width:${Math.min(100, (100 * n) / goal)}%` }))),
    db.questions.length ? null : h("section", { class: "card", style: "background:var(--butter)" }, h("h2", {}, "Your bank is empty"),
      h("p", { class: "sub" }, "Import a CSV in the Bank tab, or load a few sample questions to try the app."),
      h("div", { class: "row", style: "margin-top:8px" }, h("button", { class: "btn primary", type: "button", onclick: loadSample }, "Load samples"),
        h("button", { class: "btn", type: "button", onclick: () => go("bank", {}, true) }, "Open bank"))),
    card("mint", "Full test", "A mixed exam from the subjects you choose.",
      h("div", { class: "chips" }, ["Pick subjects", "Set counts", "Set time"].map((t) => h("span", { class: "chip" }, t))),
      h("button", { class: "btn primary", type: "button", onclick: () => (withQ.length ? go("setup", {}) : toast("Add some questions first.")) }, "Start full test")),
    card("sky", "Subject practice", "Focus on one subject at a time.",
      h("div", { class: "chips" }, db.subjects.slice(0, 4).map((s) => h("span", { class: "chip" }, s.name))),
      h("button", { class: "btn primary", type: "button", onclick: () => go("subjects", {}, true) }, "Choose subject")),
    card("peach", "Fix my mistakes", m ? `${m} question${m === 1 ? "" : "s"} you got wrong ${m === 1 ? "is" : "are"} waiting. Answer them correctly to clear them.` : "Nothing here yet. Questions you get wrong will collect here.", null,
      h("button", { class: "btn primary", type: "button", onclick: () => go("mistakes", {}, true) }, "Review mistakes")),
  ], { nav: "home" });
}

/* ---------- subjects ---------- */
function subjects() {
  show([h("div", {}, h("h1", {}, "Choose a subject"), h("p", { class: "mu", style: "margin-top:4px" }, "Practise one subject, or pick up where you stopped.")),
    h("div", { class: "list" }, db.subjects.map((s, i) => {
      const n = qsOf(s.id).length, a = acc(s.id);
      return h("button", { class: "item", type: "button", style: "background:" + PAL[i % 6], onclick: () => (n ? go("setup", { sid: s.id }) : toast("No questions yet. Add some in the Bank tab.")) },
        h("span", { class: "tile" }, s.name.slice(0, 2)), h("span", { class: "nm" }, h("b", {}, s.name), h("span", {}, `${n} question${n === 1 ? "" : "s"}`)),
        a === null ? null : h("span", { class: "pc" }, a + "%"));
    })),
    db.subjects.length ? null : h("p", { class: "mu" }, "No subjects yet. Add one in the Bank tab.")], { nav: "subjects" });
}

/* ---------- setup (full test or one subject) ---------- */
function setup(p) {
  const P = db.prefs, preset = p.sid, subs = preset ? [subj(preset)] : db.subjects;
  const S = {}; let chap, timer = P.timer, minutes = P.minutes, feedback = P.feedback, shuffleO = P.shuffleO;
  const avail = (s) => (preset ? qsOf(s.id, chap).length : qsOf(s.id).length);
  subs.forEach((s) => { const av = qsOf(s.id).length; S[s.id] = { on: av > 0 && (preset || P.on[s.id] !== false), n: Math.min(av, P.counts[s.id] || 20) }; });
  const info = h("p", { class: "mu" }), startBtn = h("button", { class: "btn primary block", type: "button" });
  const mins = () => (timer === "none" ? 0 : timer === "custom" ? Math.max(0, +minutes || 0) : +timer);
  const total = () => subs.reduce((a, s) => a + (S[s.id].on ? Math.min(S[s.id].n, avail(s)) : 0), 0);
  const refresh = () => {
    const t = total(), m = mins();
    info.textContent = t ? `${t} question${t === 1 ? "" : "s"} in total` + (m ? `, about ${Math.round((m * 60) / t)} seconds each` : "") : "Pick at least one subject.";
    startBtn.textContent = t ? `Start test: ${t} question${t === 1 ? "" : "s"}` + (m ? `, ${m} min` : "") : "Start test";
    startBtn.disabled = !t;
  };
  const rows = subs.map((s, i) => {
    const av = qsOf(s.id).length, st = S[s.id];
    if (!av) return h("div", { class: "sub-row off" }, h("input", { type: "checkbox", disabled: true, "aria-label": "Include " + s.name }), h("span", { class: "nm" }, h("b", {}, s.name), h("span", {}, "No questions yet")));
    const num = h("input", { type: "number", min: "1", max: String(av), value: String(st.n), "aria-label": s.name + " question count" });
    const set = (v) => { st.n = clamp(Math.round(v) || 1, 1, Math.max(1, avail(s))); num.value = st.n; refresh(); };
    num.addEventListener("change", () => set(+num.value));
    const avl = h("span", {}, `${av} available`);
    const row = h("div", { class: "sub-row", style: "background:" + PAL[i % 6] },
      h("input", { type: "checkbox", checked: st.on, disabled: !!preset, "aria-label": "Include " + s.name, onchange: (e) => { st.on = e.target.checked; refresh(); } }),
      h("span", { class: "nm" }, h("b", {}, s.name), avl),
      h("span", { class: "step" }, h("button", { type: "button", "aria-label": "Fewer " + s.name, onclick: () => set(st.n - 5) }, "\u2212"), num,
        h("button", { type: "button", "aria-label": "More " + s.name, onclick: () => set(st.n + 5) }, "+")));
    row._sync = () => { avl.textContent = `${avail(s)} available`; num.max = String(avail(s)); set(st.n); };
    return row;
  });
  const chapSel = preset ? h("select", { class: "in", "aria-label": "Chapter", onchange: (e) => { chap = e.target.value === "__all" ? undefined : e.target.value; rows.forEach((r) => r._sync && r._sync()); } },
    h("option", { value: "__all" }, `All chapters (${qsOf(preset).length})`),
    subj(preset).chapters.filter((c) => qsOf(preset, c.id).length).map((c) => h("option", { value: c.id }, `${c.name} (${qsOf(preset, c.id).length})`)),
    qsOf(preset, "").length ? h("option", { value: "" }, `Unsorted (${qsOf(preset, "").length})`) : null) : null;
  const seg = h("div", { class: "seg", role: "radiogroup", "aria-label": "Time limit" });
  const customIn = h("input", { class: "in", type: "number", min: "1", max: "600", value: String(minutes), "aria-label": "Custom minutes", style: "width:110px" });
  const customRow = h("div", { class: "row", style: "margin-top:12px" }, customIn, h("span", { class: "mu" }, "minutes"));
  const drawSeg = () => {
    seg.replaceChildren(...[["none", "No timer"], ["30", "30 min"], ["60", "60 min"], ["custom", "Custom"]].map(([v, l]) =>
      h("label", { class: timer === v ? "on" : "" }, h("input", { type: "radio", name: "t", checked: timer === v, onchange: () => { timer = v; drawSeg(); refresh(); } }), l)));
    customRow.classList.toggle("hidden", timer !== "custom");
  };
  customIn.addEventListener("input", () => { minutes = +customIn.value; refresh(); });
  const fbBox = h("div", { class: "col", role: "radiogroup", "aria-label": "When to show answers" });
  const drawFb = () => fbBox.replaceChildren(...[["each", "After each question", "Learn as you go, with the answer and explanation straight away."], ["end", "At the end", "Exam style. See every answer after you submit."]].map(([v, t, d]) =>
    h("label", { class: "pick" + (feedback === v ? " on" : "") }, h("input", { type: "radio", name: "f", checked: feedback === v, onchange: () => { feedback = v; drawFb(); } }), h("span", {}, h("b", {}, t), h("span", {}, d)))));
  drawSeg(); drawFb(); refresh();
  startBtn.addEventListener("click", () => {
    const items = []; let label = preset ? subj(preset).name + (chap ? ": " + chName(subj(preset), chap) : "") : "Full test";
    subs.forEach((s) => { if (S[s.id].on) items.push(...shuffle(preset ? qsOf(s.id, chap) : qsOf(s.id)).slice(0, S[s.id].n)); P.on[s.id] = S[s.id].on; P.counts[s.id] = S[s.id].n; });
    Object.assign(P, { timer, minutes: Math.max(1, +minutes || 60), feedback, shuffleO }); save();
    if (!items.length) return;
    launch({ kind: preset ? "subject" : "full", label, items, minutes: mins(), feedback, shuffleO });
  });
  show([topbar(preset ? "Practice: " + subj(preset).name : "Build your full test"),
    p.sid ? null : h("p", { class: "mu", style: "margin-top:-8px" }, "Pick subjects and how many questions from each."),
    h("section", {}, h("h3", {}, preset ? "Questions" : "Subjects and questions"), h("div", { class: "col" }, rows), chapSel ? h("div", { style: "margin-top:10px" }, chapSel) : null, h("div", { style: "margin-top:10px" }, info)),
    h("section", { class: "box" }, h("h3", {}, "Time limit"), seg, customRow),
    h("section", { class: "box" }, h("h3", {}, "When to show answers"), fbBox,
      h("label", { class: "row", style: "margin-top:12px;font-size:14px;font-weight:700" }, h("input", { type: "checkbox", checked: shuffleO, style: "width:22px;height:22px;accent-color:var(--ac)", onchange: (e) => { shuffleO = e.target.checked; } }), "Shuffle answer options")),
    h("div", { class: "startbar" }, startBtn)]);
}

/* ---------- test ---------- */
function stopTimer() { if (T && T.iv) { clearInterval(T.iv); T.iv = null; } }
function launch(a) {
  stopTimer();
  const items = a.items.map((q) => {
    if (!a.shuffleO) return { ...q };
    const o = shuffle(q.opts.map((t, i) => ({ t, c: i === q.ans })));
    return { ...q, opts: o.map((x) => x.t), ans: o.findIndex((x) => x.c) };
  });
  T = { spec: a, kind: a.kind, label: a.label, items, i: 0, ans: [], feedback: a.feedback, t0: Date.now(), endAt: a.minutes ? Date.now() + a.minutes * 60000 : 0, done: false, iv: null };
  if (T.endAt) T.iv = setInterval(tick, 500);
  go("test");
}
function tick() {
  if (!T || T.done) return stopTimer();
  const left = Math.max(0, Math.round((T.endAt - Date.now()) / 1000));
  if (T.timerEl) { T.timerEl.textContent = fmt(left); T.timerEl.classList.toggle("warn", left <= 60); }
  if (left <= 0) submit(true);
}
function test(_p, scroll = true) {
  if (!T) return go("home", {}, true);
  const q = T.items[T.i], each = T.feedback === "each", a = T.ans[T.i], locked = each && a != null, last = T.i === T.items.length - 1;
  const mark = (d, c) => h("span", { class: "mk", style: "color:" + c }, svg(d, 2.5, 22));
  const opts = q.opts.map((t, i) => {
    let cls = "opt";
    if (locked) cls += i === q.ans ? " correct" : i === a ? " wrong" : " dim"; else if (a === i) cls += " picked";
    return h("button", { class: cls, type: "button", disabled: locked, onclick: () => choose(i) }, h("span", { class: "key" }, L[i]), rich(t, "span"),
      locked && i === q.ans ? mark(ICON.ok, "#1D6B49") : locked && i === a ? mark(ICON.close, "#9C2F3B") : null);
  });
  const left = T.endAt ? Math.max(0, Math.round((T.endAt - Date.now()) / 1000)) : 0;
  T.timerEl = T.endAt ? h("span", { class: "timer" + (left <= 60 ? " warn" : "") }, fmt(left)) : null;
  const s = subj(q.sid);
  show([
    h("div", { class: "row sp" }, h("button", { class: "ic", type: "button", "aria-label": "Close test", style: "margin-left:-12px", onclick: back }, svg(ICON.close)),
      h("span", { class: "mu", style: "font-weight:700", dir: "auto" }, T.label), T.timerEl || h("span", { class: "mu" }, `${T.i + 1} / ${T.items.length}`)),
    h("div", { class: "bar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(T.items.length), "aria-valuenow": String(T.i + 1) }, h("i", { style: `width:${((T.i + 1) / T.items.length) * 100}%` })),
    h("section", { class: "qcard" }, h("p", { class: "mu" }, `Question ${T.i + 1} of ${T.items.length}` + (s ? ", " + s.name : "")), h("h2", {}, rich(q.q)), h("div", { class: "col" }, opts)),
    locked && q.exp ? h("div", { class: "expl" }, rich(q.exp)) : null,
    h("div", { class: "row", style: "margin-top:auto" },
      !each && T.i > 0 ? h("button", { class: "btn", type: "button", onclick: () => { T.i--; test(0); } }, "Previous") : null,
      each && a == null ? null : h("button", { class: "btn primary grow", type: "button", onclick: last ? () => submit(false) : () => { T.i++; test(0); } }, last ? (each ? "Finish" : "Submit test") : "Next")),
  ], { scroll, preserveQuestion: !scroll });
}
function choose(i) {
  const q = T.items[T.i];
  if (T.feedback === "each") { if (T.ans[T.i] != null) return; T.ans[T.i] = i; record(q, i === q.ans); }
  else T.ans[T.i] = i;
  test(0, false);
}
function submit(timeUp) {
  if (!T || T.done) return;
  const un = T.items.filter((_, i) => T.ans[i] == null).length;
  if (!timeUp && un && !confirm(`${un} question${un > 1 ? "s are" : " is"} unanswered. Submit anyway?`)) return;
  stopTimer();
  if (T.feedback !== "each") T.items.forEach((q, i) => { if (T.ans[i] != null) record(q, T.ans[i] === q.ans, true); });
  const score = T.items.filter((q, i) => T.ans[i] === q.ans).length, total = T.items.length, secs = Math.round((Date.now() - T.t0) / 1000);
  db.history.push({ ts: Date.now(), kind: T.kind, label: T.label, score, total, secs });
  db.history = db.history.slice(-500); save();
  RES = { spec: T.spec, items: T.items, ans: T.ans, feedback: T.feedback, label: T.label, score, total, secs, timeUp };
  T.done = true;
  go("result", {}, true);
}

/* ---------- result ---------- */
function result() {
  if (!RES) return go("home", {}, true);
  const R = RES, pct = R.total ? Math.round((100 * R.score) / R.total) : 0;
  const wrongIdx = R.items.map((_, i) => i).filter((i) => R.ans[i] !== R.items[i].ans);
  const verdict = pct >= 80 ? "Excellent work." : pct >= 50 ? "Good effort. Review the misses below." : "Keep practising. Try the missed ones again.";
  const by = {};
  R.items.forEach((q, i) => { const b = by[q.sid] || (by[q.sid] = { c: 0, t: 0 }); b.t++; if (R.ans[i] === q.ans) b.c++; });
  let mode = R.feedback === "end" ? "all" : "wrong";
  const list = h("div"), cW = h("button", { type: "button" }, `Wrong (${wrongIdx.length})`), cA = h("button", { type: "button" }, `All (${R.total})`);
  const review = (q, a, i) => h("div", { class: "review" }, h("p", { class: "mu" }, `Question ${i + 1}` + (subj(q.sid) ? ", " + subj(q.sid).name : "")), rich(q.q),
    h("div", {}, a == null ? h("span", { class: "tag w" }, "Not answered") : a === q.ans ? h("span", { class: "tag g", dir: "auto" }, `Your answer: ${L[a]}. ${q.opts[a]}`) : h("span", { class: "tag r", dir: "auto" }, `Your answer: ${L[a]}. ${q.opts[a]}`),
      a === q.ans ? null : h("span", { class: "tag g", dir: "auto" }, `Correct: ${L[q.ans]}. ${q.opts[q.ans]}`)),
    q.exp ? h("div", { class: "expl", style: "margin-top:8px" }, rich(q.exp)) : null);
  const draw = () => {
    cW.className = mode === "wrong" ? "on" : ""; cA.className = mode === "all" ? "on" : "";
    const idx = R.items.map((_, i) => i).filter((i) => mode === "all" || R.ans[i] !== R.items[i].ans);
    list.replaceChildren(...(idx.length ? idx.map((i) => review(R.items[i], R.ans[i], i)) : [h("p", { class: "mu" }, "Nothing wrong here. Great job!")]));
    typeset(list);
  };
  cW.onclick = () => { mode = "wrong"; draw(); }; cA.onclick = () => { mode = "all"; draw(); };
  const clean = (q) => ({ id: q.id, sid: q.sid, cid: q.cid, q: q.q, opts: q.opts, ans: q.ans, exp: q.exp });
  show([
    h("section", { class: "box center" }, h("h1", {}, R.timeUp ? "Time is up" : "Test complete"), h("div", { class: "ring", style: `--p:${pct}` }, h("div", {}, pct + "%")),
      h("p", { style: "font-size:1.15rem;font-weight:800" }, `${R.score} out of ${R.total} correct`),
      h("p", { class: "mu", style: "margin-top:4px" }, `${verdict} Time: ${fmt(R.secs)}.`),
      h("div", { class: "row", style: "justify-content:center;margin-top:16px" },
        h("button", { class: "btn primary", type: "button", onclick: () => launch({ ...R.spec, items: R.items.map(clean) }) }, "Retake"),
        wrongIdx.length ? h("button", { class: "btn", type: "button", onclick: () => launch({ kind: "mistakes", label: "Retry: " + R.label, items: wrongIdx.map((i) => clean(R.items[i])), minutes: 0, feedback: "each", shuffleO: false }) }, `Retry ${wrongIdx.length} wrong`) : null,
        h("button", { class: "btn", type: "button", onclick: () => go("home", {}, true) }, "Home"))),
    Object.keys(by).length > 1 ? h("section", { class: "box" }, h("h3", {}, "By subject"), h("div", { class: "bars" }, Object.entries(by).map(([sid, b]) => {
      const p = Math.round((100 * b.c) / b.t);
      return h("div", {}, h("div", { class: "lab" }, h("span", { dir: "auto" }, subj(sid) ? subj(sid).name : "Deleted subject"), h("span", {}, `${b.c}/${b.t}`)), h("div", { class: "meter line" + (p >= 70 ? " good" : "") }, h("i", { style: `width:${p}%` })));
    }))) : null,
    h("section", { class: "box" }, h("h3", {}, "Review answers"), h("div", { class: "seg", style: "margin-bottom:8px" }, cW, cA), list),
  ]);
  draw();
}

/* ---------- mistakes ---------- */
function mistakes() {
  const w = db.questions.filter((q) => db.wrong[q.id]).sort((a, b) => db.wrong[b.id].n - db.wrong[a.id].n);
  const by = db.subjects.map((s, i) => ({ s, i, list: w.filter((q) => q.sid === s.id) })).filter((x) => x.list.length);
  const go30 = (list, label) => launch({ kind: "mistakes", label, items: list.slice(0, 30), minutes: 0, feedback: "each", shuffleO: false });
  show([
    h("div", {}, h("h1", {}, "Fix my mistakes"), h("p", { class: "mu", style: "margin-top:4px" }, "Answer a question correctly and it leaves this list.")),
    h("section", { class: "card", style: "background:var(--peach)" }, h("h2", {}, w.length ? `${w.length} question${w.length === 1 ? "" : "s"} to fix` : "No mistakes right now"),
      h("p", { class: "sub" }, w.length ? "The ones you missed most often come first." : "Take a test and the questions you miss will collect here."),
      w.length ? h("button", { class: "btn primary", type: "button", onclick: () => go30(w, "Mistakes") }, `Practise ${Math.min(30, w.length)} now`) : null),
    by.length ? h("div", { class: "list" }, by.map((x) => h("button", { class: "item", type: "button", style: "background:" + PAL[x.i % 6], onclick: () => go30(x.list, x.s.name + ": mistakes") },
      h("span", { class: "tile" }, x.s.name.slice(0, 2)), h("span", { class: "nm" }, h("b", {}, x.s.name), h("span", {}, `${x.list.length} to fix`)), h("span", { class: "pc" }, "Start")))) : null,
    w.length ? h("button", { class: "btn danger", type: "button", onclick: () => { if (confirm("Clear the whole mistakes list?")) { db.wrong = {}; save(); render(); } } }, "Clear list") : null,
  ], { nav: "mistakes" });
}

/* ---------- bank ---------- */
function bank() {
  show([h("div", {}, h("h1", {}, "Question bank"), h("p", { class: "mu", style: "margin-top:4px" }, "Pick a subject to add and organise its questions.")),
    h("div", { class: "list" }, db.subjects.map((s, i) => h("button", { class: "item", type: "button", style: "background:" + PAL[i % 6], onclick: () => go("subjectBank", { sid: s.id }) },
      h("span", { class: "tile" }, s.name.slice(0, 2)), h("span", { class: "nm" }, h("b", {}, s.name), h("span", {}, `${qsOf(s.id).length} questions, ${s.chapters.length} chapters`))))),
    h("button", { class: "btn ghost block", type: "button", onclick: () => { const n = (prompt("Subject name") || "").trim(); if (n) { db.subjects.push({ id: uid(), name: n.slice(0, 40), chapters: [] }); save(); render(); } } }, "Add subject")], { nav: "bank" });
}
function subjectBank(p) {
  const s = subj(p.sid); if (!s) return go("bank", {}, true);
  const uns = qsOf(s.id, "").length;
  const chRow = (cid, name, n, bg, tile) => h("div", { class: "item", style: "background:" + bg + ";cursor:default" },
    h("button", { class: "tile", type: "button", style: "border:0;cursor:pointer", "aria-label": "Open " + name, onclick: () => go("chapterView", { sid: s.id, cid }) }, tile),
    h("span", { class: "nm", onclick: () => go("chapterView", { sid: s.id, cid }), style: "cursor:pointer" }, h("b", { dir: "auto" }, name), h("span", {}, `${n} question${n === 1 ? "" : "s"}`)),
    h("button", { class: "ic", type: "button", "aria-label": name + " options", style: "margin-right:-8px", onclick: () => sheet(name, [
      n ? ["Practise this chapter", () => launch({ kind: "subject", label: s.name + ": " + name, items: shuffle(qsOf(s.id, cid)).slice(0, 50), minutes: 0, feedback: "each", shuffleO: false })] : null,
      ["View questions", () => go("chapterView", { sid: s.id, cid })],
      cid ? ["Rename chapter", () => { const t = (prompt("Chapter name", name) || "").trim(); if (t) { s.chapters.find((c) => c.id === cid).name = t.slice(0, 40); save(); render(); } }] : null,
      cid ? ["Delete chapter (questions become Unsorted)", () => { if (confirm("Delete this chapter?")) { s.chapters = s.chapters.filter((c) => c.id !== cid); db.questions.forEach((q) => { if (q.sid === s.id && q.cid === cid) q.cid = ""; }); save(); render(); } }, 1] : null]) }, svg(ICON.more, 3)));
  show([topbar(s.name, () => sheet(s.name, [
    ["Rename subject", () => { const t = (prompt("Subject name", s.name) || "").trim(); if (t) { s.name = t.slice(0, 40); save(); render(); } }],
    ["Delete subject and its questions", () => { if (confirm(`Delete "${s.name}" and all ${qsOf(s.id).length} of its questions?`)) { dropQuestions(qsOf(s.id).map((q) => q.id)); db.subjects = db.subjects.filter((x) => x.id !== s.id); save(); go("bank", {}, true); } }, 1]])),
    h("div", { class: "chips" }, h("span", { class: "chip lav" }, `${qsOf(s.id).length} questions`), h("span", { class: "chip lav" }, `${s.chapters.length} chapters`)),
    h("div", { class: "row" }, h("button", { class: "btn primary grow", type: "button", onclick: () => go("qedit", { sid: s.id, cid: "" }) }, "Add question"),
      h("button", { class: "btn grow", type: "button", onclick: () => pickFile(".csv,text/csv,text/plain", (f) => readFile(f, (t) => importText(t, s.id, ""))) }, "Import CSV")),
    h("section", {}, h("h3", {}, "Chapters"), h("div", { class: "list" }, s.chapters.map((c, i) => chRow(c.id, c.name, qsOf(s.id, c.id).length, PAL[i % 6], "Ch " + (i + 1))), uns ? chRow("", "Unsorted", uns, "var(--butter)", "--") : null)),
    h("button", { class: "btn ghost block", type: "button", onclick: () => { const n = (prompt("Chapter name") || "").trim(); if (n) { s.chapters.push({ id: uid(), name: n.slice(0, 40) }); save(); render(); } } }, "New chapter"),
    h("p", { class: "mu" }, "CSV columns: question, option_a to option_d, answer (A, 2 or the option text), explanation (optional), chapter (optional, creates folders automatically)."),
  ], { nav: "bank" });
}
function chapterView(p) {
  const s = subj(p.sid); if (!s) return go("bank", {}, true);
  const list = qsOf(s.id, p.cid || "");
  show([topbar(s.name + ": " + chName(s, p.cid || "")),
    h("button", { class: "btn primary", type: "button", onclick: () => go("qedit", { sid: s.id, cid: p.cid || "" }) }, "Add question"),
    h("section", { class: "box" }, list.length ? list.map((q) => h("div", { class: "qrow" }, h("div", { class: "qt", dir: "auto" }, q.q.length > 110 ? q.q.slice(0, 110) + "..." : q.q),
      h("div", { class: "row", style: "flex-wrap:nowrap" }, h("button", { class: "btn", type: "button", style: "min-height:40px;padding:0 12px", onclick: () => go("qedit", { id: q.id }) }, "Edit"),
        h("button", { class: "btn danger", type: "button", style: "min-height:40px;padding:0 12px", "aria-label": "Delete question", onclick: () => { if (confirm("Delete this question?")) { dropQuestions([q.id]); save(); render(); } } }, "Delete")))) : h("p", { class: "mu" }, "No questions here yet.")),
  ], { nav: "bank" });
}
function qedit(p) {
  const ex = p.id ? db.questions.find((q) => q.id === p.id) : null;
  let sid = ex ? ex.sid : p.sid, cid = ex ? ex.cid || "" : p.cid || "";
  const sSel = h("select", { class: "in", id: "s" }, db.subjects.map((s) => h("option", { value: s.id }, s.name))); sSel.value = sid;
  const cSel = h("select", { class: "in", id: "c" });
  const fillC = () => { const s = subj(sSel.value); cSel.replaceChildren(h("option", { value: "" }, "Unsorted"), ...s.chapters.map((c) => h("option", { value: c.id }, c.name))); cSel.value = s.chapters.some((c) => c.id === cid) ? cid : ""; };
  sSel.addEventListener("change", () => { cid = ""; fillC(); }); fillC();
  const qIn = h("textarea", { class: "in", id: "q", rows: "3", value: ex ? ex.q : "" }), eIn = h("input", { class: "in", id: "e", type: "text", value: ex ? ex.exp : "" });
  const box = h("div", { class: "col" }), rowsEl = [];
  const addOpt = (text = "", checked = false) => {
    const i = rowsEl.length, r = h("input", { type: "radio", name: "ans", "aria-label": "Mark option " + L[i] + " as correct" }), t = h("input", { class: "in", type: "text", placeholder: "Option " + L[i], "aria-label": "Option " + L[i], value: text });
    r.checked = checked; rowsEl.push({ r, t }); box.append(h("div", { class: "orow" }, r, t));
  };
  const n0 = ex ? ex.opts.length : 4;
  for (let i = 0; i < n0; i++) addOpt(ex ? ex.opts[i] : "", ex ? i === ex.ans : i === 0);
  const more = h("button", { class: "btn", type: "button", onclick: () => { if (rowsEl.length < 6) { addOpt(); if (rowsEl.length === 6) more.classList.add("hidden"); } } }, "Add option");
  if (n0 >= 6) more.classList.add("hidden");
  const saveQ = (another) => {
    const q = qIn.value.trim(), filled = rowsEl.map((o, i) => [i, o.t.value.trim(), o.r.checked]).filter((x) => x[1]);
    if (!q) return toast("Type the question first.");
    if (filled.length < 2) return toast("Fill in at least two options.");
    const ci = filled.findIndex((x) => x[2]);
    if (ci < 0) return toast("Tap the circle next to the correct option.");
    const obj = { id: ex ? ex.id : uid(), sid: sSel.value, cid: cSel.value, q, opts: filled.map((x) => x[1]), ans: ci, exp: eIn.value.trim() };
    if (ex) db.questions[db.questions.indexOf(ex)] = obj; else db.questions.push(obj);
    save();
    if (another && !ex) { qIn.value = ""; eIn.value = ""; rowsEl.forEach((o, i) => { o.t.value = ""; o.r.checked = i === 0; }); toast("Saved. Add the next one."); qIn.focus(); }
    else { toast("Question saved"); back(); }
  };
  show([h("div", { class: "top" }, h("button", { class: "ic", type: "button", "aria-label": "Close", onclick: back }, svg(ICON.close)), h("h1", {}, ex ? "Edit question" : "Add question")),
    h("div", { class: "row", style: "flex-wrap:nowrap;align-items:flex-start" }, h("div", { class: "grow" }, h("label", { class: "f", for: "s" }, "Subject"), sSel), h("div", { class: "grow" }, h("label", { class: "f", for: "c" }, "Chapter"), cSel)),
    h("div", {}, h("label", { class: "f", for: "q" }, "Question"), qIn, h("p", { class: "mu", style: "margin-top:4px;font-size:12px" }, "Supports $math$, `code` and code blocks. Tap the circle to mark the correct option.")),
    h("div", {}, h("label", { class: "f" }, "Options"), box, h("div", { style: "margin-top:8px" }, more)),
    h("div", {}, h("label", { class: "f", for: "e" }, "Explanation (optional)"), eIn),
    h("div", { class: "col", style: "margin-top:auto" }, h("button", { class: "btn primary block", type: "button", onclick: () => saveQ(false) }, "Save question"), ex ? null : h("button", { class: "btn block", type: "button", onclick: () => saveQ(true) }, "Save and add another"))]);
}

/* ---------- progress ---------- */
function chart(vals) {
  const W = 320, H = 110, P = 14, ns = "http://www.w3.org/2000/svg";
  const el = (n, a) => { const e = document.createElementNS(ns, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const s = el("svg", { viewBox: `0 0 ${W} ${H}`, class: "chart", role: "img", "aria-label": "Score history" });
  const x = (i) => (vals.length < 2 ? W / 2 : P + (i * (W - 2 * P)) / (vals.length - 1)), y = (v) => H - P - (v / 100) * (H - 2 * P);
  [0, 50, 100].forEach((g) => s.append(el("line", { x1: P, x2: W - P, y1: y(g), y2: y(g), class: "grid" })));
  s.append(el("polyline", { points: vals.map((v, i) => x(i) + "," + y(v)).join(" "), class: "ln" }));
  vals.forEach((v, i) => s.append(el("circle", { cx: x(i), cy: y(v), r: 3.5 })));
  return s;
}
function progress() {
  const n = db.daily[today()] || 0, hist = db.history.slice(-20), rec = db.history.slice(-8).reverse();
  const bars = db.subjects.map((s) => ({ s, a: acc(s.id) })).filter((x) => x.a !== null);
  const bar = (label, p, extra) => h("div", {}, h("div", { class: "lab" }, h("span", { dir: "auto" }, label), h("span", {}, p + "%" + (extra || ""))), h("div", { class: "meter line" + (p >= 70 ? " good" : "") }, h("i", { style: `width:${p}%` })));
  show([h("h1", {}, "Your progress"),
    h("section", { class: "box" }, h("h3", {}, "Streak and daily goal"), h("p", {}, `${streak()} day streak. Today: ${n} of ${db.goal} questions.`),
      h("button", { class: "btn", type: "button", style: "margin-top:10px", onclick: () => { const g = parseInt(prompt("Daily goal (questions per day)", db.goal), 10); if (g > 0) { db.goal = Math.min(g, 1000); save(); render(); } } }, "Change goal")),
    h("section", { class: "box" }, h("h3", {}, "Accuracy by subject"), bars.length ? h("div", { class: "bars" }, bars.map((x) => bar(x.s.name, x.a))) : h("p", { class: "mu" }, "Answer some questions to see accuracy here.")),
    h("section", { class: "box" }, h("h3", {}, "Score history"),
      hist.length ? [chart(hist.map((x) => (x.total ? Math.round((100 * x.score) / x.total) : 0))),
        h("table", {}, h("tr", {}, ["Date", "Test", "Score", "Time"].map((t) => h("th", {}, t))),
          rec.map((r) => h("tr", {}, h("td", {}, dkey(new Date(r.ts)).slice(5)), h("td", { dir: "auto" }, r.label), h("td", {}, `${r.score}/${r.total}`), h("td", {}, fmt(r.secs)))))] : h("p", { class: "mu" }, "Finish a test to start your history.")),
    h("section", { class: "box" }, h("h3", {}, "Backup"), h("p", { class: "mu", style: "margin-bottom:10px" }, "Your data lives only on this device. Save a backup file to keep it safe or move it to another phone."),
      h("div", { class: "row" },
        h("button", { class: "btn", type: "button", onclick: () => saveFile("mcq-backup-" + today() + ".json", JSON.stringify(db), "application/json") }, "Export backup"),
        h("button", { class: "btn", type: "button", onclick: () => pickFile(".json,application/json", (f) => readFile(f, (t) => {
          try { const d = JSON.parse(t); if (!d || !Array.isArray(d.subjects) || !Array.isArray(d.questions)) throw new Error("bad"); if (!confirm("Replace everything on this device with this backup?")) return; const b = blank(); db = Object.assign(b, d, { prefs: Object.assign(b.prefs, d.prefs || {}) }); save(); toast("Backup restored"); render(); }
          catch (e) { toast("That file is not a valid backup."); }
        })) }, "Restore backup")),
      h("div", { class: "row", style: "margin-top:10px" }, h("button", { class: "btn danger", type: "button", onclick: () => { if (confirm("Delete ALL data on this device? This cannot be undone.")) { db = seed(); save(); toast("Everything was reset"); render(); } } }, "Reset all data"))),
  ], { nav: "progress" });
}

const VIEWS = { home, subjects, setup, test, result, mistakes, bank, subjectBank, chapterView, qedit, progress };
window.__t = { get db() { return db; }, get T() { return T; }, get RES() { return RES; }, go, render, launch, choose, submit, parseCSV, importText, loadSample, record, test, stack: () => stack };
history.replaceState({ n: 1 }, "");
render();
