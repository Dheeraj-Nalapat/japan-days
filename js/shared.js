/* Japan Days — Shared Module */
const JD = (function () {
  const AUTH_HASH = 'b181ca2307e6900f3d218dcabd221d64d0296cffbac6fa70a89815e67a3a49b1';
  const AUTH_KEY = 'jd-auth';
  const DATA_DIR = 'data';

  async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function isAuthed() {
    return sessionStorage.getItem(AUTH_KEY) === 'ok';
  }

  function showAuthGate() {
    return new Promise(resolve => {
      if (isAuthed()) { resolve(); return; }

      const overlay = document.createElement('div');
      overlay.className = 'auth-gate';
      overlay.innerHTML = `
        <div class="auth-card">
          <div class="auth-jp">日本</div>
          <div class="auth-label">Japan 2026</div>
          <div class="auth-subtitle">Enter password to continue</div>
          <form class="auth-form" autocomplete="off">
            <input type="password" class="auth-input" placeholder="Password" autofocus autocomplete="current-password">
            <button type="submit" class="auth-btn">Enter</button>
          </form>
          <div class="auth-error"></div>
        </div>`;
      document.body.appendChild(overlay);

      const form = overlay.querySelector('.auth-form');
      const input = overlay.querySelector('.auth-input');
      const error = overlay.querySelector('.auth-error');

      form.addEventListener('submit', async e => {
        e.preventDefault();
        const hash = await sha256(input.value);
        if (hash === AUTH_HASH) {
          sessionStorage.setItem(AUTH_KEY, 'ok');
          overlay.classList.add('auth-fade');
          setTimeout(() => { overlay.remove(); resolve(); }, 400);
        } else {
          error.textContent = 'Incorrect password';
          input.value = '';
          input.focus();
        }
      });
    });
  }

  /* YAML loading */
  async function loadYAML(name) {
    const res = await fetch(`${DATA_DIR}/${name}.yaml`);
    if (!res.ok) throw new Error(`Failed to load ${name}.yaml: ${res.status}`);
    const text = await res.text();
    return jsyaml.load(text);
  }

  async function loadData(files) {
    const entries = await Promise.all(files.map(async f => [f, await loadYAML(f)]));
    return Object.fromEntries(entries);
  }

  /* Sanitiser */
  function esc(str) {
    if (str == null) return '';
    const el = document.createElement('span');
    el.textContent = String(str);
    return el.innerHTML;
  }

  /* Theme */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('jd-theme', next);
    applyTheme(next);
  }

  function initTheme() {
    applyTheme(localStorage.getItem('jd-theme') || 'light');
  }

  /* Nav */
  function renderNav(data) {
    const container = document.getElementById('navLinks');
    if (!container) return;
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    container.innerHTML = data.trip.nav_links.map(l => {
      const active = l.href === currentPage ? ' class="active"' : '';
      return `<a href="${esc(l.href)}"${active}>${esc(l.text)}</a>`;
    }).join('');

    const nav = document.getElementById('nav');
    if (nav) {
      if (currentPage === 'index.html' || currentPage === '') {
        window.addEventListener('scroll', () => {
          nav.classList.toggle('visible', window.scrollY > window.innerHeight * 0.5);
        });
      } else {
        nav.classList.add('visible');
      }
    }
  }

  /* Footer */
  function renderFooter(data) {
    const el = document.getElementById('footer');
    if (!el || !data.trip || !data.trip.footer) return;
    const f = data.trip.footer;
    el.innerHTML = `<p>${f.line1}</p><p style="margin-top:0.5rem;">${f.line2}</p>`;
  }

  /* Modal */
  function openModal(html) {
    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('modalOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const ol = document.getElementById('modalOverlay');
    if (ol) ol.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  function mapsLink(query) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  /* Loader */
  function hideLoader() {
    const loader = document.getElementById('loadingScreen');
    if (!loader) return;
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 600);
  }

  function showError(msg) {
    const loader = document.getElementById('loadingScreen');
    if (loader) {
      loader.innerHTML = `<div class="loading-text" style="color: var(--vermilion);">
        Error: ${msg}<br>Make sure YAML files exist in the data/ folder.</div>`;
    }
  }

  function citySlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  /* Boot sequence: auth → load data → render → hide loader */
  async function boot(files, renderFn) {
    initTheme();
    await showAuthGate();
    try {
      const data = await loadData(files);
      renderNav(data);
      renderFooter(data);
      await renderFn(data);
      hideLoader();
    } catch (err) {
      console.error('Boot failed:', err);
      showError(err.message);
    }
  }

  /* Expose to window for onclick handlers */
  window.toggleTheme = toggleTheme;
  window.closeModal = closeModal;

  return {
    boot, esc, loadData, loadYAML,
    openModal, closeModal, mapsLink, citySlug,
    renderNav, renderFooter, hideLoader, showError,
    toggleTheme, initTheme
  };
})();
