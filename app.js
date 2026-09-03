const C = INVITATION;
const $ = id => document.getElementById(id);
const set = (id, value) => { const e = $(id); if (e) e.textContent = value; };

set('splashGroom', C.couple.groom);
set('splashBride', C.couple.bride);
set('splashDate', C.dateFrench);
set('groom', C.couple.groom);
set('bride', C.couple.bride);
set('footerGroom', C.couple.groom);
set('footerBride', C.couple.bride);
set('dateFrench', C.dateFrench);
set('timeFrench', C.timeFrench);
const arabicLines = C.arabicInvitation.split('\n');
$('arabicInvitation').innerHTML = arabicLines[0] + '\n<strong>' + (arabicLines[1] || '') + '</strong>';
set('arabicDate', C.arabicDate);
set('venueNameHero', C.venue);
set('venueCityHero', C.city);
set('venueName', C.venue);
set('venueCity', C.city);
set('dressIntro', C.dress.intro);
set('ladiesDress', C.dress.ladies);
set('gentlemenDress', C.dress.gentlemen);
$('mapsBtn').href = C.mapsUrl;
$('venueMap').src = 'https://maps.google.com/maps?q=30.0890703,31.348924&z=17&output=embed';

const gallery = $('gallery');
const galleryImgs = C.gallery.map(src => `<figure class="gallery-card"><img src="${src}" alt="Wedding photo"></figure>`).join('');
gallery.innerHTML = galleryImgs + galleryImgs;

function tick() {
  let diff = new Date(C.date) - new Date();
  if (diff < 0) diff = 0;
  let s = Math.floor(diff / 1000), d = Math.floor(s / 86400); s %= 86400;
  let h = Math.floor(s / 3600); s %= 3600;
  let m = Math.floor(s / 60); s %= 60;
  set('days', String(d).padStart(2,'0')); set('hours', String(h).padStart(2,'0'));
  set('minutes', String(m).padStart(2,'0')); set('seconds', String(s).padStart(2,'0'));
}
tick(); setInterval(tick, 1000);

const opening = $('opening');
let closing = false;
function closeOpening() {
  if (closing) return;
  closing = true;
  opening.classList.add('closing');
  opening.style.transition = 'opacity 1.2s ease';
  opening.style.opacity = '0';
  setTimeout(() => opening.remove(), 1250);
}

if (C.splash.enabled) {
  requestAnimationFrame(() => opening.classList.add('play'));
  setTimeout(closeOpening, C.splash.duration);
  if (!C.splash.showSkip) $('skipOpening').style.display = 'none';
  $('skipOpening').onclick = closeOpening;
} else {
  closeOpening();
}

const obs = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) e.target.classList.add('visible');
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(e => obs.observe(e));

$('openMessage').addEventListener('click', () => {
  $('messageForm').classList.add('open');
  $('openMessage').style.display = 'none';
  document.querySelector('#messageForm input').focus();
});

$('messageForm').addEventListener('submit', async e => {
  e.preventDefault();
  const name = e.target.name.value.trim();
  const message = e.target.message.value.trim();
  const msgEl = $('formMessage');
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  if (window.location.protocol === 'file:') {
    msgEl.textContent = 'This needs the server. Close this page and run `node server.js`, then open http://localhost:3000.';
    msgEl.classList.add('error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message })
    });
    if (!res.ok) throw new Error('bad response');
    msgEl.textContent = 'Merci ! Your message has been delivered.';
    msgEl.classList.remove('error');
    msgEl.classList.add('success');
    e.target.reset();
  } catch (err) {
    msgEl.textContent = 'Could not reach the server. Make sure it is running with `node server.js`, then try again.';
    msgEl.classList.remove('success');
    msgEl.classList.add('error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

const music = $('music');
const musicToggle = $('musicToggle');
music.volume = 0.25;
let musicStarted = false;

function startMusic() {
  if (musicStarted) return;
  music.play().then(() => {
    musicStarted = true;
    musicToggle.classList.add('playing');
  }).catch(() => {});
}
music.play().then(() => {
  musicStarted = true;
}).catch(() => {
  musicToggle.classList.remove('playing');
  ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(ev => window.addEventListener(ev, startMusic, { once: true }));
});
musicToggle.addEventListener('click', () => {
  if (music.paused) {
    music.play();
    musicStarted = true;
    musicToggle.classList.add('playing');
  } else {
    music.pause();
    musicToggle.classList.remove('playing');
  }
});
