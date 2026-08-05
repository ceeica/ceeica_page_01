// Menú móvil
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      const expanded = links.classList.contains('open');
      toggle.setAttribute('aria-expanded', String(expanded));
    });
  }

  // Genera las barras del waveform decorativo con alturas/duraciones variadas
  document.querySelectorAll('.waveform').forEach((wf) => {
    const bars = 22;
    for (let i = 0; i < bars; i++) {
      const bar = document.createElement('div');
      bar.className = 'bar';
      const duration = (0.8 + Math.random() * 1.2).toFixed(2);
      const delay = (Math.random() * 1.2).toFixed(2);
      bar.style.animationDuration = `${duration}s`;
      bar.style.animationDelay = `${delay}s`;
      wf.appendChild(bar);
    }
  });
});
