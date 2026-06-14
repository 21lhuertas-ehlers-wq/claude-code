/* === HELPERS === */
const clamp01 = v => Math.min(Math.max(v, 0), 1);
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const mapRange = (p, start, end) => clamp01((p - start) / (end - start));

/* === STEAM PARTICLES (hero only) === */
const steamEl = document.getElementById('steam');
for (let i = 0; i < 24; i++) {
  const p = document.createElement('div');
  p.className = 'steam-particle';
  const size = 30 + Math.random() * 60;
  p.style.width = p.style.height = size + 'px';
  p.style.left = Math.random() * 100 + '%';
  p.style.setProperty('--drift', (Math.random() * 140 - 70) + 'px');
  p.style.animationDuration = (9 + Math.random() * 12) + 's';
  p.style.animationDelay = (Math.random() * 16) + 's';
  steamEl.appendChild(p);
}

/* === MANIFEST WORD REVEAL === */
const manifestEl = document.getElementById('manifestText');
const manifestSentence = 'Seit 1999 duftet es in unserem Haus in Büderich nach Paprika, Zwiebeln und langsam geschmortem Rindfleisch. Aus einer alten Dorfwirtschaft wurde unser Brauereiausschank — mit deftiger Düsseldorfer Küche, rheinischen Tapas und frisch gezapftem Altbier. Ehrlich, bodenständig und immer mit Herz.';
manifestEl.innerHTML = manifestSentence.split(' ').map(w => `<span class="word">${w}</span>`).join(' ');
const wordEls = manifestEl.querySelectorAll('.word');

/* === DISH SECTIONS === */
const dishIds = ['dish1', 'dish2', 'dish3'];

/* === GALLERY === */
const galleryEl = document.getElementById('gallery');
const galleryTrack = document.getElementById('galleryTrack');
const galleryCards = [...galleryTrack.querySelectorAll('.gallery-card')];

/* === SHARED REFERENCES === */
const hero = document.getElementById('hero');
const heroContent = document.getElementById('heroContent');
const manifestPin = document.getElementById('manifest');
const progressBar = document.getElementById('scrollProgress');
const navEl = document.getElementById('nav');

function sectionProgress(el) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const total = rect.height - vh;
  if (total <= 0) return 0;
  return clamp01(-rect.top / total);
}

/* === MAIN UPDATE LOOP === */
function update() {
  const vh = window.innerHeight;
  const docHeight = document.documentElement.scrollHeight;

  // Scroll progress bar
  progressBar.style.width = (scrollY / (docHeight - vh)) * 100 + '%';

  // Nav background
  navEl.classList.toggle('scrolled', scrollY > 40);

  // Hero parallax
  const heroP = clamp01(-hero.getBoundingClientRect().top / vh);
  heroContent.style.opacity = String(1 - heroP * 1.6);
  heroContent.style.transform = `scale(${1 - heroP * 0.25}) translateY(${heroP * -40}px)`;

  // Manifest word reveal
  const manifestP = sectionProgress(manifestPin);
  const activeCount = Math.floor(manifestP * wordEls.length * 1.15);
  wordEls.forEach((w, i) => {
    w.classList.toggle('active', i < activeCount);
    w.classList.toggle('current', i === activeCount - 1);
  });

  // Dish sections
  dishIds.forEach(id => {
    const el = document.getElementById(id);
    const p = sectionProgress(el);
    el.style.setProperty('--plate', mapRange(p, 0, 0.4));
    el.style.setProperty('--ing-a', mapRange(p, 0.25, 0.55));
    el.style.setProperty('--ing-b', mapRange(p, 0.35, 0.65));
    el.style.setProperty('--ing-c', mapRange(p, 0.45, 0.75));
    el.style.setProperty('--ing-d', mapRange(p, 0.55, 0.85));
    el.style.setProperty('--info', mapRange(p, 0.65, 1));
  });

  // Gallery horizontal scroll + 3D rotation
  const galleryP = sectionProgress(galleryEl);
  const maxScroll = Math.max(galleryTrack.scrollWidth - window.innerWidth, 0);
  const offset = galleryP * maxScroll;
  galleryTrack.style.transform = `translate3d(${-offset}px,0,0)`;

  const viewportCenter = window.innerWidth / 2;
  galleryCards.forEach(card => {
    const cardCenter = card.offsetLeft + card.offsetWidth / 2 - offset;
    const dist = (cardCenter - viewportCenter) / window.innerWidth;
    const rotateY = clamp(dist * -28, -28, 28);
    const scale = 1 - Math.min(Math.abs(dist) * 0.22, 0.22);
    card.style.transform = `perspective(1200px) rotateY(${rotateY}deg) scale(${scale})`;
  });
}

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { update(); ticking = false; });
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
update();

/* === STAT COUNTERS === */
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count, 10);
    const start = performance.now();
    const dur = 1800;
    const step = now => {
      const t = clamp01((now - start) / dur);
      el.textContent = Math.floor((1 - Math.pow(1 - t, 3)) * target);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.counter').forEach(c => counterObserver.observe(c));

/* === MENU CARD REVEAL === */
const menuObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      menuObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.menu-card').forEach((c, i) => {
  c.style.transitionDelay = `${(i % 3) * 100}ms`;
  menuObserver.observe(c);
});
