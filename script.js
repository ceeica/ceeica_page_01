// ============================================================
// CEEICA — script.js
// ============================================================

const TMDB_KEY = '3b04a73b0b31f1a590e3e5a5c202c4b5';
const TMDB_IMG_W = 'https://image.tmdb.org/t/p/w500';
const TMDB_IMG_L = 'https://image.tmdb.org/t/p/w780';

document.addEventListener('DOMContentLoaded', () => {

  // -------------------- Modo oscuro --------------------
  const root = document.documentElement;
  const STORAGE_KEY = 'ceeica-theme';
  const saved       = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark      = saved ? saved === 'dark' : prefersDark;
  if (isDark) root.classList.add('dark');
  updateLogo(isDark);

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

  function updateLogo(dark) {
    const logo = document.querySelector('img.logo-slot');
    if (!logo) return;
    logo.src = dark ? 'assets/logo_ceeica_neg.svg' : 'assets/logo_ceeica.svg';
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

  // -------------------- TMDB --------------------
  loadMovieGrid();
  loadNextMovie();

});

// ============================================================
// Fetch película por ID de TMDB
// Devuelve objeto con todos los campos necesarios
// ============================================================
async function fetchMovieById(id) {
  const url = `https://api.themoviedb.org/3/movie/${id}`
    + `?api_key=${TMDB_KEY}`
    + `&language=es-MX`
    + `&append_to_response=credits`;
  try {
    const res  = await fetch(url);
    if (!res.ok) return null;
    const d    = await res.json();
    const director = d.credits?.crew?.find(p => p.job === 'Director')?.name || '—';
    const genres   = d.genres?.map(g => g.name).join(', ') || '—';
    const runtime  = d.runtime ? `${Math.floor(d.runtime / 60)}h ${d.runtime % 60}min` : '—';
    const rating   = d.vote_average ? d.vote_average.toFixed(1) : '—';
    return {
      id,
      title:       d.title,
      year:        d.release_date?.slice(0, 4) || '',
      poster:      d.poster_path  ? `${TMDB_IMG_W}${d.poster_path}`  : null,
      posterLarge: d.poster_path  ? `${TMDB_IMG_L}${d.poster_path}`  : null,
      overview:    d.overview || '',
      director,
      genres,
      runtime,
      rating,
    };
  } catch {
    return null;
  }
}

// ============================================================
// Grilla de películas vistas
// ============================================================
async function loadMovieGrid() {
  const cards = document.querySelectorAll('#movie-grid .cover-card');
  if (!cards.length) return;

  for (const card of cards) {
    const { tmdbId, date } = card.dataset;
    if (!tmdbId) continue;

    card.innerHTML = `<div class="cover-art">Cargando…</div>`;

    const m = await fetchMovieById(tmdbId);

    if (!m) {
      card.innerHTML = `<div class="cover-art">Sin datos</div><p>ID ${tmdbId}</p><p class="meta">${date || ''}</p>`;
      continue;
    }

    card.innerHTML = m.poster
      ? `<div class="cover-art"><img src="${m.poster}" alt="Póster de ${m.title}" loading="lazy"></div>`
      : `<div class="cover-art">Sin póster</div>`;
    card.innerHTML += `<p>${m.title} <span style="font-weight:400;color:var(--ink-soft);">(${m.year})</span></p>
                       <p class="meta">${date || ''}</p>`;

    // Guarda los datos en el nodo para el modal
    card._movieData = { ...m, date };
    card.classList.add('has-modal');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Ver detalles de ${m.title}`);
    card.addEventListener('click', () => openModal(card._movieData));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(card._movieData); });
  }
}

// ============================================================
// Próxima película
// ============================================================
async function loadNextMovie() {
  const el = document.querySelector('[data-next-movie]');
  if (!el) return;

  const { tmdbId, by, date } = el.dataset;
  if (!tmdbId) return;

  const m = await fetchMovieById(tmdbId);
  if (!m) return;

  const posterEl = el.querySelector('.next-cover');
  const infoEl   = el.querySelector('.next-info');

  if (posterEl) {
    posterEl.innerHTML = m.poster
      ? `<img src="${m.poster}" alt="Póster de ${m.title}" loading="lazy">`
      : 'Sin póster';
    posterEl.classList.remove('cover-art'); // quita el cuadrado genérico
  }

  if (infoEl) {
    infoEl.innerHTML = `
      <p class="next-title">${m.title} <span class="next-year">(${m.year})</span></p>
      <div class="next-meta-row">
        <span>${m.director}</span>
        <span>${m.genres}</span>
        <span>${m.runtime}</span>
        <span>★ ${m.rating}</span>
      </div>
      <p class="meta" style="margin:4px 0 0;">🎧 Idioma original · Subtítulos en español</p>
      ${by   ? `<p class="meta" style="margin-top:10px;">Propuesta por: <strong>${by}</strong></p>` : ''}
      ${date ? `<p class="meta">${date}</p>` : ''}
    `;
  }

  // También clickable para abrir modal
  el.classList.add('has-modal');
  el.style.cursor = 'pointer';
  el.addEventListener('click', () => openModal({ ...m, date }));
}

// ============================================================
// Modal
// ============================================================
const modal    = document.getElementById('movie-modal');
const modalBox = modal?.querySelector('.modal-box');

function openModal(m) {
  if (!modal) return;

  modal.querySelector('.modal-poster').innerHTML = m.posterLarge
    ? `<img src="${m.posterLarge}" alt="Póster de ${m.title}">`
    : `<div class="cover-art">Sin póster</div>`;

  modal.querySelector('.modal-info').innerHTML = `
    <h2 class="modal-title">${m.title}</h2>
    <p class="modal-year">${m.year}</p>
    <div class="modal-tags">
      <span>${m.genres}</span>
      <span>${m.runtime}</span>
      <span>★ ${m.rating}</span>
    </div>
    <p class="modal-director">Dir. ${m.director}</p>
    <p class="modal-lang">🎧 Idioma original · Subtítulos en español</p>
    ${m.date ? `<p class="modal-date">Vista el ${m.date}</p>` : ''}
  `;

  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  modal.querySelector('.modal-close').focus();
}

function closeModal() {
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = '';
}

// Cierra con botón X
modal?.querySelector('.modal-close').addEventListener('click', closeModal);

// Cierra haciendo clic en el overlay (fuera del box)
modal?.addEventListener('click', (e) => {
  if (!modalBox?.contains(e.target)) closeModal();
});

// Cierra con Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});