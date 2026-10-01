/* ====== SONG SETTINGS — change these ====== */
const SONG_START = 0;   // seconds where the clip begins
const SONG_END   = 60;  // seconds where the clip ends (then it loops softly)
const VOLUME     = 0.7;
/* ========================================== */

const $ = s => document.querySelector(s);
const song = $('#song');
let playing = false;

/* ---------- music with fade + segment loop ---------- */
function fadeTo(v, ms = 1500) {
  const from = song.volume, t0 = performance.now();
  (function step(t) {
    const k = Math.min((t - t0) / ms, 1);
    song.volume = Math.max(0, Math.min(1, from + (v - from) * k));
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}
function playSong() {
  song.currentTime = SONG_START; song.volume = 0;
  song.play().then(() => { playing = true; fadeTo(VOLUME, 2500); }).catch(() => {});
}
song.addEventListener('timeupdate', () => {
  if (song.currentTime >= SONG_END - 1.5 && playing && song.volume > 0.05 && !song._fading) {
    song._fading = true; fadeTo(0, 1400);
    setTimeout(() => { song.currentTime = SONG_START; fadeTo(VOLUME, 2000); song._fading = false; }, 1500);
  }
});
$('#music').onclick = () => {
  if (playing) { song.pause(); playing = false; $('#music').classList.add('off'); }
  else { song.play(); playing = true; $('#music').classList.remove('off'); fadeTo(VOLUME, 800); }
};

/* ---------- intro ---------- */
$('#start').onclick = () => {
  $('#intro').classList.add('gone');
  $('#site').hidden = false; $('#music').hidden = false; $('#hint').hidden = false;
  playSong();
  burst(innerWidth / 2, innerHeight / 2, 18);
  setTimeout(() => $('#hint').remove(), 6500);
};

/* ---------- scroll reveals + live counter ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) {
    e.target.classList.add('show');
    if (e.target.classList.contains('live')) runCounter();
    io.unobserve(e.target);
  }
}), { threshold: .35 });
function observeAll() { document.querySelectorAll('.st,.polaroid,.code').forEach(el => io.observe(el)); }
observeAll();

let counting = false;
function runCounter() {
  if (counting) return; counting = true;
  let n = 0;
  setInterval(() => { n++; $('#love').textContent = n; $('#mem').textContent = n; }, 700);
}

/* ---------- click effects ---------- */
const COLORS = [['#ff4d79', '#ffc2d1'], ['#ffb347', '#fff1b8'], ['#b9a8ff', '#efe9ff'], ['#ff7a9c', '#ffe0e8']];
function bloom(x, y, big = false,keep = false) {
  const [c1, c2] = COLORS[Math.floor(Math.random() * COLORS.length)];
  const f = document.createElement('div');
  f.className = 'flower';
  f.style.cssText = `left:${x}px;top:${y}px;--c1:${c1};--c2:${c2};transform:scale(${big ? 1.3 : 1}) rotate(${Math.random() * 40}deg)`;
  const stem = document.createElement('div'); stem.className = 'stem'; f.appendChild(stem);
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div'); p.className = 'petal';
    p.style.setProperty('--a', i * 45 + 'deg'); p.style.setProperty('--i', i); f.appendChild(p);
  }
  const core = document.createElement('div'); core.className = 'core'; f.appendChild(core);
  document.body.appendChild(f);
    if (keep) {
    f.classList.add('keep');          // garden flowers stay on screen
  } else {
    setTimeout(() => f.classList.add('out'), 3500);
    setTimeout(() => f.remove(), 5200);
  }
}
function burst(x, y, n = 10) {
  const set = ['♥', '✦', '∞', 'π', '∫', '✿', '♡'];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span'); s.className = 'pop';
    s.textContent = set[Math.floor(Math.random() * set.length)];
    const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 110;
    s.style.cssText = `left:${x}px;top:${y}px;color:${COLORS[i % 4][0]};--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d - 40}px;--rot:${Math.random() * 360}deg`;
    document.body.appendChild(s); setTimeout(() => s.remove(), 1400);
  }
}
document.addEventListener('click', e => {   // opens
  if (e.target.closest('button')) return;
  bloom(e.clientX, e.clientY);
  burst(e.clientX, e.clientY, 8);
});
 /* ---------- Garden + Anniversary ---------- */
const FLOWERS = 14;        // how many flowers in the garden
const GAP = 220;           // ms between each flower
let partyTimer = null;

// Build the text once: each letter becomes its own <span> so it can animate alone
function buildAnnivText() {
  const box = $('#annivText');
  if (box.children.length) return;           // already built
  const lines = [
    ['l1', 'HAPPY ANNIVERSARY'],
    ['l2', '4 YEARS'],
    ['l3', 'আর সামনে আরও অনন্ত ♥']
  ];
  let d = 0;                                 // running delay counter
  lines.forEach(([cls, text]) => {
    const row = document.createElement('span');
    row.className = 'line ' + cls;
    [...text].forEach(c => {                 // [...text] splits into characters
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = c === ' ' ? '\u00A0' : c;   // keep spaces visible
      s.style.setProperty('--d', d++);
      row.appendChild(s);
    });
    box.appendChild(row);
  });
}

function showAnniversary() {
  buildAnnivText();
  $('#anniv').classList.add('show');
  // keep sprinkling hearts and symbols while this screen is open
  partyTimer = setInterval(() => {
    burst(Math.random() * innerWidth, Math.random() * innerHeight * 0.8, 6);
  }, 1100);
}

function hideAnniversary() {
  $('#anniv').classList.remove('show');
  clearInterval(partyTimer);
  document.querySelectorAll('.flower.keep').forEach(f => f.remove());
}

$('#bloom').onclick = e => {
  const r = e.target.getBoundingClientRect();
  for (let i = 0; i < FLOWERS; i++) {
    setTimeout(() => {
      bloom(Math.random() * innerWidth, innerHeight * (0.3 + Math.random() * 0.6), true, true);
    }, i * GAP);
  }
  burst(r.left + r.width / 2, r.top, 30);
  // show the message after the last flower has opened
  setTimeout(showAnniversary, FLOWERS * GAP + 1500);
};

$('#annivClose').onclick = hideAnniversary;

/* ---------- background: stars + drifting math symbols ---------- */
const cv = $('#bg'), cx = cv.getContext('2d');
let W, H, items = [];
const SYM = ['∫', '∂', 'π', '∞', 'Σ', '√', 'θ', '♥', 'dx', 'e^iπ', '1', '0'];
function resize() {
  W = cv.width = innerWidth; H = cv.height = innerHeight;
  items = Array.from({ length: Math.min(60, Math.floor(W / 22)) }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    s: 10 + Math.random() * 22, v: .15 + Math.random() * .4,
    t: SYM[Math.floor(Math.random() * SYM.length)], p: Math.random() * 6,
    star: Math.random() < .45
  }));
}
addEventListener('resize', resize); resize();
(function draw(t) {
  cx.clearRect(0, 0, W, H);
  items.forEach(o => {
    o.y -= o.v; o.x += Math.sin(t / 2000 + o.p) * .25;
    if (o.y < -30) { o.y = H + 30; o.x = Math.random() * W; }
    if (o.star) { cx.fillStyle = `rgba(245,217,139,${.25 + .5 * Math.abs(Math.sin(t / 900 + o.p))})`; cx.fillRect(o.x, o.y, 2, 2); }
    else { cx.fillStyle = 'rgba(185,168,255,.22)'; cx.font = `${o.s}px 'Fira Code',monospace`; cx.fillText(o.t, o.x, o.y); }
  });
  requestAnimationFrame(draw);
})(0);

/* ---------- polaroid tap = heart burst ---------- */
document.querySelectorAll('.polaroid').forEach(p => p.addEventListener('click', e => burst(e.clientX, e.clientY, 14)));
