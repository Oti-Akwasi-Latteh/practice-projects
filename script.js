/* ===========================
   Birthday Page – script.js
   For: Abena Ruth 🎂
   =========================== */

// ── Floating Hearts ──────────────────────────────────────────────
const heartEmojis = ['❤️','💖','💗','💕','💓','🌸','💝','✨'];
const heartsBg    = document.getElementById('heartsBg');

function createHeart() {
  const el   = document.createElement('div');
  el.className = 'heart';
  el.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];

  const size  = 0.9 + Math.random() * 1.2;
  const left  = Math.random() * 100;
  const dur   = 7 + Math.random() * 8;
  const delay = Math.random() * 6;

  el.style.cssText = `
    left: ${left}%;
    font-size: ${size}rem;
    animation-duration: ${dur}s;
    animation-delay: ${delay}s;
  `;
  heartsBg.appendChild(el);
  setTimeout(() => el.remove(), (dur + delay) * 1000);
}

// Seed initial hearts, then keep spawning
for (let i = 0; i < 18; i++) createHeart();
setInterval(createHeart, 900);


// ── Balloons ──────────────────────────────────────────────────────
const balloonEmojis = ['🎈','🎀','🎊','🎁','🪅','🎆'];
const balloonsEl    = document.getElementById('balloons');

function createBalloon() {
  const el  = document.createElement('div');
  el.className = 'balloon';
  el.textContent = balloonEmojis[Math.floor(Math.random() * balloonEmojis.length)];

  const left  = Math.random() * 100;
  const dur   = 10 + Math.random() * 10;
  const delay = Math.random() * 8;
  const size  = 1.8 + Math.random() * 1.2;

  el.style.cssText = `
    left: ${left}%;
    font-size: ${size}rem;
    animation-duration: ${dur}s;
    animation-delay: ${delay}s;
  `;
  balloonsEl.appendChild(el);
  setTimeout(() => el.remove(), (dur + delay) * 1000);
}

for (let i = 0; i < 8; i++) createBalloon();
setInterval(createBalloon, 2800);


// ── Sparkles ──────────────────────────────────────────────────────
const sparkleChars = ['✨','⭐','🌟','💫','★','✦','✶'];
const sparklesEl   = document.getElementById('sparkles');

function createSparkle() {
  const el  = document.createElement('div');
  el.className = 'sparkle';
  el.textContent = sparkleChars[Math.floor(Math.random() * sparkleChars.length)];

  const top   = Math.random() * 100;
  const left  = Math.random() * 100;
  const dur   = 2 + Math.random() * 3;
  const delay = Math.random() * 4;
  const size  = 0.8 + Math.random() * 0.8;

  el.style.cssText = `
    top: ${top}%;
    left: ${left}%;
    font-size: ${size}rem;
    animation-duration: ${dur}s;
    animation-delay: ${delay}s;
  `;
  sparklesEl.appendChild(el);
  setTimeout(() => el.remove(), (dur + delay) * 1000 + 500);
}

for (let i = 0; i < 20; i++) createSparkle();
setInterval(createSparkle, 600);


// ── Blow Candles & Confetti ────────────────────────────────────────
const confettiColors = [
  '#f9587a','#f7c948','#b86fd6','#5ec4b0',
  '#ff8fab','#ffd700','#c0304f','#7ec8e3'
];

function spawnConfetti() {
  const count = 120;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';

    const x     = Math.random() * 100;
    const dur   = 2.5 + Math.random() * 2.5;
    const delay = Math.random() * 1.2;
    const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    const size  = 6 + Math.random() * 8;
    const shape = Math.random() > 0.5 ? '50%' : '2px';

    piece.style.cssText = `
      left: ${x}vw;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${shape};
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
    `;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), (dur + delay) * 1000 + 200);
  }
}

function blowCandles() {
  // Extinguish all flames
  document.querySelectorAll('.flame').forEach(f => f.classList.add('out'));

  // Show confetti
  spawnConfetti();

  // Show wish message
  const msg = document.getElementById('confettiMsg');
  msg.classList.add('show');

  // Hide button
  const btn = document.getElementById('wishBtn');
  btn.style.opacity = '0';
  btn.style.pointerEvents = 'none';

  // Re-light after 5 seconds for fun
  setTimeout(() => {
    document.querySelectorAll('.flame').forEach(f => f.classList.remove('out'));
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
    msg.classList.remove('show');
  }, 5000);
}

// Expose to HTML onclick
window.blowCandles = blowCandles;


// ── Title typing effect for extra delight ─────────────────────────
function typeEffect(el, text, speed = 60) {
  el.textContent = '';
  let i = 0;
  const interval = setInterval(() => {
    el.textContent += text[i++];
    if (i >= text.length) clearInterval(interval);
  }, speed);
}

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    typeEffect(document.querySelector('.title'), 'Happy Birthday', 65);
  }, 1500);
});
