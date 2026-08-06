// ============================================================
// CEEICA — script.js
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // -------------------- Modo oscuro --------------------
  const root = document.documentElement;
  const STORAGE_KEY = 'ceeica-theme';

  const saved       = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark      = saved ? saved === 'dark' : prefersDark;
  if (isDark) root.classList.add('dark');
  updateLogo(isDark);

  // Crea e inserta el botón toggle en el nav
  const btn = document.createElement('button');
  btn.className = 'theme-toggle';
  btn.setAttribute('aria-label', 'Cambiar modo claro/oscuro');
  btn.textContent = isDark ? '☀︎' : '☽';
  const nav = document.querySelector('.nav');
  if (nav) nav.appendChild(btn);

  btn.addEventListener('click', () => {
    const dark = root.classList.toggle('dark');
    btn.textContent = dark ? '☀︎' : '☽';
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
    updateLogo(dark);
  });

  // Cambia el logo entre positivo y negativo según el modo
  function updateLogo(dark) {
    const logo = document.querySelector('img.logo-slot');
    if (!logo) return;
    logo.src = dark ? 'logo_ceeica_neg.svg' : 'logo_ceeica.svg';
  }

  // -------------------- Menú móvil --------------------
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(links.classList.contains('open')));
    });
  }

  // -------------------- Waveform --------------------
  document.querySelectorAll('.waveform').forEach((wf) => {
    for (let i = 0; i < 22; i++) {
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.animationDuration = `${(0.8 + Math.random() * 1.2).toFixed(2)}s`;
      bar.style.animationDelay    = `${(Math.random() * 1.2).toFixed(2)}s`;
      wf.appendChild(bar);
    }
  });

});