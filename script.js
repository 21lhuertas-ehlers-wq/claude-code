/* === NAV === */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), { passive: true });

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle?.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

/* === COUNTER ANIMATION === */
function animateCounter(el, target, duration) {
  const isFloat = target !== Math.floor(target);
  const start = performance.now();
  const step = now => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = eased * target;
    el.textContent = isFloat ? val.toFixed(1) : Math.floor(val);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = isFloat ? target.toFixed(1) : target;
  };
  requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const card = entry.target;
    const counter = card.querySelector('.counter');
    const raw = card.dataset.float || card.dataset.count;
    const target = parseFloat(raw);
    animateCounter(counter, target, 2200);
    statObserver.unobserve(card);
  });
}, { threshold: 0.4 });

document.querySelectorAll('.stat-card').forEach(c => statObserver.observe(c));

/* === BAR CHART === */
const countries = [
  { name: 'Honduras',         rate: 66, flag: '🇭🇳' },
  { name: 'Guatemala',        rate: 62, flag: '🇬🇹' },
  { name: 'Nicaragua',        rate: 53, flag: '🇳🇮' },
  { name: 'Bolivia',          rate: 47, flag: '🇧🇴' },
  { name: 'Paraguay',         rate: 41, flag: '🇵🇾' },
  { name: 'Ecuador',          rate: 35, flag: '🇪🇨' },
  { name: 'Perú',             rate: 32, flag: '🇵🇪' },
  { name: 'Colombia',         rate: 30, flag: '🇨🇴' },
  { name: 'México',           rate: 27, flag: '🇲🇽' },
  { name: 'Brasil',           rate: 22, flag: '🇧🇷' },
  { name: 'Argentina',        rate: 20, flag: '🇦🇷' },
  { name: 'Costa Rica',       rate: 14, flag: '🇨🇷' },
  { name: 'Chile',            rate: 12, flag: '🇨🇱' },
  { name: 'Uruguay',          rate:  8, flag: '🇺🇾' },
];

function barColor(rate) {
  if (rate > 50) return '#ef4444';
  if (rate > 30) return '#f59e0b';
  if (rate > 15) return '#3b82f6';
  return '#10b981';
}

const chartEl = document.getElementById('barChart');
if (chartEl) {
  countries.forEach(c => {
    const color = barColor(c.rate);
    const pct = (c.rate / 70) * 100;
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `
      <div class="bar-flag">${c.flag}</div>
      <div class="bar-name">${c.name}</div>
      <div class="bar-track">
        <div class="bar-fill" data-pct="${pct}" style="background:${color}"></div>
      </div>
      <div class="bar-value">${c.rate}%</div>
    `;
    chartEl.appendChild(row);
  });

  const chartObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      chartEl.querySelectorAll('.bar-fill').forEach((bar, i) => {
        setTimeout(() => { bar.style.width = bar.dataset.pct + '%'; }, i * 60);
      });
      chartObserver.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  chartObserver.observe(chartEl);
}

/* === PROGRESS BARS === */
const progressObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.animate-bar').forEach((bar, i) => {
      setTimeout(() => bar.classList.add('set'), i * 200 + 300);
    });
    progressObserver.unobserve(entry.target);
  });
}, { threshold: 0.3 });

document.querySelectorAll('.progress-card').forEach(c => progressObserver.observe(c));

/* === MEMORY GAME === */
const pairs = [
  { id: 0, emoji: '🍽️', fact: '16 millones de niños sufren hambre extrema en América Latina' },
  { id: 1, emoji: '📚', fact: '4 millones de niños no tienen acceso a la escuela primaria' },
  { id: 2, emoji: '💧', fact: '23 millones de niños viven sin acceso a agua potable' },
  { id: 3, emoji: '🏥', fact: '1 de cada 3 niños no recibe atención médica básica' },
  { id: 4, emoji: '🏠', fact: '33% de los niños vive en viviendas precarias sin saneamiento' },
  { id: 5, emoji: '👷', fact: '5.5 millones de niños trabajan ilegalmente en lugar de estudiar' },
  { id: 6, emoji: '💰', fact: '76 millones de niños viven en situación de pobreza en la región' },
  { id: 7, emoji: '🌱', fact: 'Chile y Uruguay tienen las tasas de pobreza infantil más bajas: bajo el 12%' },
];

let flipped = [], locked = false, pairsFound = 0, moves = 0;

function buildGame() {
  const grid = document.getElementById('memoryGrid');
  if (!grid) return;
  grid.innerHTML = '';
  flipped = []; locked = false; pairsFound = 0; moves = 0;
  document.getElementById('pairsFound').textContent = '0';
  document.getElementById('movesCount').textContent = '0';
  document.getElementById('gameComplete').hidden = true;

  const cards = [];
  pairs.forEach(p => {
    cards.push({ pair: p.id, type: 'emoji', content: p.emoji });
    cards.push({ pair: p.id, type: 'fact',  content: p.fact  });
  });

  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  cards.forEach(card => {
    const el = document.createElement('div');
    el.className = 'mem-card';
    el.dataset.pair = card.pair;
    el.dataset.type = card.type;
    el.innerHTML = `
      <div class="mem-inner">
        <div class="mem-front"><div class="mem-front-q">?</div></div>
        <div class="mem-back ${card.type === 'emoji' ? 'is-emoji' : 'is-fact'}">${card.content}</div>
      </div>
    `;
    el.addEventListener('click', () => handleFlip(el));
    grid.appendChild(el);
  });
}

function handleFlip(card) {
  if (locked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
  card.classList.add('flipped');
  flipped.push(card);

  if (flipped.length === 2) {
    moves++;
    document.getElementById('movesCount').textContent = moves;
    locked = true;
    checkPair();
  }
}

function checkPair() {
  const [a, b] = flipped;
  const match = a.dataset.pair === b.dataset.pair && a.dataset.type !== b.dataset.type;

  if (match) {
    a.classList.add('matched');
    b.classList.add('matched');
    pairsFound++;
    document.getElementById('pairsFound').textContent = pairsFound;
    flipped = [];
    locked = false;
    if (pairsFound === pairs.length) {
      setTimeout(() => {
        document.getElementById('finalMoves').textContent = moves;
        document.getElementById('gameComplete').hidden = false;
      }, 600);
    }
  } else {
    setTimeout(() => {
      a.classList.remove('flipped');
      b.classList.remove('flipped');
      flipped = [];
      locked = false;
    }, 1100);
  }
}

document.getElementById('resetGame')?.addEventListener('click', buildGame);
document.getElementById('playAgain')?.addEventListener('click', buildGame);
buildGame();

/* === SCROLL REVEAL === */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(
  '.stat-card, .program-card, .cf-step, .compare-col, .progress-card, .org-chip'
).forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  revealObserver.observe(el);
});
