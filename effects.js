// ============================================
// 1. STARFIELD BACKGROUND - parallax with mouse
// ============================================
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');

let mouseX = 0, mouseY = 0;
let w, h;

const stars = [];
const STAR_COUNT = 180;

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = document.body.scrollHeight;
}

function initStars() {
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      depth: Math.random() * 3 + 1,
      baseAlpha: Math.random() * 0.6 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
    });
  }
}

function drawStars(time) {
  ctx.clearRect(0, 0, w, h);
  const mx = (mouseX - w / 2) / w;
  const my = (mouseY - h / 2) / h;

  for (const s of stars) {
    const parallaxX = mx * s.depth * 15;
    const parallaxY = my * s.depth * 15;
    const twinkle = Math.sin(time * s.twinkleSpeed + s.twinklePhase) * 0.3 + 0.7;
    const alpha = s.baseAlpha * twinkle;

    ctx.beginPath();
    ctx.arc(s.x + parallaxX, s.y + parallaxY, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 180, 255, ${alpha})`;
    ctx.fill();
  }

  requestAnimationFrame(drawStars);
}

resize();
initStars();
requestAnimationFrame(drawStars);
window.addEventListener('resize', resize);

// ============================================
// 2. GLOBAL MOUSE TRACKING
// ============================================
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// ============================================
// 3. HERO LOGO - floating + glow follow cursor
// ============================================
const heroLogo = document.querySelector('.hero-logo');
const heroGlow = document.querySelector('.hero-glow');

if (heroLogo) {
  document.addEventListener('mousemove', (e) => {
    const rect = heroLogo.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / 30;
    const dy = (e.clientY - cy) / 30;
    heroLogo.style.transform = `translate(${dx}px, ${dy}px)`;
  });
}

if (heroGlow) {
  document.addEventListener('mousemove', (e) => {
    heroGlow.style.left = e.clientX + 'px';
    heroGlow.style.top = (e.clientY + window.scrollY) + 'px';
    heroGlow.style.transform = 'translate(-50%, -50%)';
  });
}

// ============================================
// 4. FEATURE CARDS - tilt on hover
// ============================================
document.querySelectorAll('.feature-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
    card.style.boxShadow = `${-x * 20}px ${-y * 20}px 40px rgba(0, 230, 118, 0.08)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.boxShadow = '';
  });
});

// ============================================
// 5. TOOL ITEMS - glow cursor trail
// ============================================
document.querySelectorAll('.tool-item').forEach((item) => {
  item.addEventListener('mousemove', (e) => {
    const rect = item.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    item.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 230, 118, 0.08) 0%, transparent 60%)`;
    item.style.borderColor = 'rgba(0, 230, 118, 0.3)';
  });

  item.addEventListener('mouseleave', () => {
    item.style.background = '';
    item.style.borderColor = 'transparent';
  });
});

// ============================================
// 6. ARCHITECTURE BOXES - pulse on hover
// ============================================
document.querySelectorAll('.arch-box').forEach((box) => {
  box.addEventListener('mouseenter', () => {
    box.style.transform = 'scale(1.08)';
    box.style.borderColor = '#00e676';
    box.style.boxShadow = '0 0 30px rgba(0, 230, 118, 0.2)';
  });
  box.addEventListener('mouseleave', () => {
    box.style.transform = '';
    if (!box.classList.contains('highlight')) {
      box.style.borderColor = '';
      box.style.boxShadow = '';
    }
  });
});

// ============================================
// 7. SCROLL REVEAL - fade in sections
// ============================================
const revealElements = document.querySelectorAll('.feature-card, .tool-item, .step, .arch-box, h2, .hero-terminal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

revealElements.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = `opacity 0.6s ease ${i % 6 * 0.08}s, transform 0.6s ease ${i % 6 * 0.08}s`;
  revealObserver.observe(el);
});

// ============================================
// 8. TERMINAL TYPING EFFECT
// ============================================
const terminalBody = document.querySelector('.terminal-body');

if (terminalBody) {
  const html = terminalBody.innerHTML;
  terminalBody.innerHTML = '';
  terminalBody.style.minHeight = '180px';

  let revealed = false;
  const termObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !revealed) {
      revealed = true;
      typeTerminal(terminalBody, html);
      termObserver.disconnect();
    }
  }, { threshold: 0.5 });

  termObserver.observe(terminalBody);
}

function typeTerminal(el, html) {
  let i = 0;
  const speed = 8;
  let inTag = false;

  function tick() {
    if (i >= html.length) return;

    // Skip over HTML tags instantly
    if (html[i] === '<') inTag = true;
    if (inTag) {
      let chunk = '';
      while (i < html.length && inTag) {
        chunk += html[i];
        if (html[i] === '>') inTag = false;
        i++;
      }
      el.innerHTML += chunk;
      tick();
      return;
    }

    // Handle HTML entities (&lt; &gt; &amp; etc.) as single unit
    if (html[i] === '&') {
      let entity = '';
      while (i < html.length && html[i] !== ';') {
        entity += html[i];
        i++;
      }
      entity += ';'; // include the semicolon
      i++;
      el.innerHTML += entity;
      setTimeout(tick, speed);
      return;
    }

    el.innerHTML += html[i];
    i++;
    setTimeout(tick, speed);
  }

  tick();
}

// ============================================
// 9. MAGNETIC BUTTONS
// ============================================
document.querySelectorAll('.btn').forEach((btn) => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

// ============================================
// REVEALED CLASS
// ============================================
document.head.insertAdjacentHTML('beforeend', `
  <style>
    .revealed {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  </style>
`);
