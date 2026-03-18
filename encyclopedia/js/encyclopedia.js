// encyclopedia.js — ładuje dane z plików JSON

let CATEGORY = 'metals';
let entries = [];
let filtered = [];
const PAGE_SIZE = 48;
let currentPage = 1;

// =========================================
// INIT — ładuj z JSON
// =========================================
async function initEncyclopedia(category) {
  CATEGORY = category;

  // Sprawdź czy mamy lokalnie zapisane (dodane przez użytkownika)
  const userAdded = JSON.parse(localStorage.getItem(`enc_user_${category}`) || '[]');

  // Ładuj z pliku JSON
  try {
    const res = await fetch(`../data/encyclopedia/${category}.json`);
    if (!res.ok) throw new Error('brak pliku');
    const data = await res.json();
    entries = [...data, ...userAdded];
  } catch {
    // Fallback — tylko dane użytkownika
    entries = userAdded;
    console.warn(`Nie znaleziono data/encyclopedia/${category}.json`);
  }

  buildUniverseFilter();
  render();
}

// =========================================
// FILTRY
// =========================================
function buildUniverseFilter() {
  const sel = document.getElementById('universe-filter');
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = '<option value="">Wszystkie światy / panteony</option>';
  const universes = [...new Set(entries.map(e => e.universe))].sort((a,b)=>a.localeCompare(b,'pl'));
  universes.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u; opt.textContent = u;
    sel.appendChild(opt);
  });
  if (current) sel.value = current;
}

function getFiltered() {
  const q   = (document.getElementById('search')?.value || '').toLowerCase();
  const uni = document.getElementById('universe-filter')?.value || '';

  return entries.filter(e => {
    const matchQ = !q
      || e.name.toLowerCase().includes(q)
      || (e.desc||'').toLowerCase().includes(q)
      || (e.tags||[]).join(' ').toLowerCase().includes(q)
      || (e.universe||'').toLowerCase().includes(q);
    const matchU = !uni || e.universe === uni;
    return matchQ && matchU;
  });
}

// =========================================
// RENDER
// =========================================
function render() {
  currentPage = 1;
  filtered = getFiltered();
  renderPage();
  renderPagination();
  renderCount();
}

function renderPage() {
  const grid = document.getElementById('grid');
  if (!grid) return;

  const start = (currentPage - 1) * PAGE_SIZE;
  const page  = filtered.slice(start, start + PAGE_SIZE);

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--ink-faded);font-style:italic;padding:3rem">Brak wyników.</p>';
    return;
  }

  grid.innerHTML = page.map(e => {
    const tagsHTML = [
      e.universe ? `<span class="tag gold">${e.universe}</span>` : '',
      e.plec && e.plec !== 'brak' ? `<span class="tag">${e.plec}</span>` : '',
      ...(e.tags || []).slice(0, 3).map(t => `<span class="tag">${t}</span>`)
    ].join('');

    const descPreview = (e.desc || '').slice(0, 120) + ((e.desc||'').length > 120 ? '…' : '');

    return `<div class="entry-card" onclick="openDetail(${e.id})">
      <h4>${e.name}</h4>
      <div class="entry-tags">${tagsHTML}</div>
      <p>${descPreview}</p>
      ${e.appearances ? `<div class="entry-origin">📍 ${e.appearances}</div>` : ''}
      <span class="read-hint">kliknij po więcej →</span>
    </div>`;
  }).join('');
}

function renderPagination() {
  let pagination = document.getElementById('pagination');
  if (!pagination) {
    pagination = document.createElement('div');
    pagination.id = 'pagination';
    pagination.style.cssText = 'display:flex;gap:0.5rem;flex-wrap:wrap;justify-content:center;margin:1.5rem 0;position:relative;z-index:1';
    document.getElementById('grid')?.after(pagination);
  }

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  if (totalPages <= 1) { pagination.innerHTML = ''; return; }

  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    const active = i === currentPage ? 'background:var(--red);color:var(--parchment);border-color:var(--red)' : '';
    html += `<button onclick="goPage(${i})" style="padding:0.3rem 0.75rem;font-family:var(--font-heading);font-size:0.78rem;border:2px solid var(--border2);border-radius:2px;cursor:pointer;background:var(--bg2);${active}">${i}</button>`;
  }
  pagination.innerHTML = html;
}

function renderCount() {
  let countEl = document.getElementById('result-count');
  if (!countEl) {
    countEl = document.createElement('p');
    countEl.id = 'result-count';
    countEl.style.cssText = 'font-family:var(--font-heading);font-size:0.8rem;color:var(--ink-muted);margin-bottom:1rem;letter-spacing:0.06em';
    document.getElementById('grid')?.before(countEl);
  }
  countEl.textContent = `Znaleziono: ${filtered.length} wpisów`;
}

function goPage(n) {
  currentPage = n;
  renderPage();
  renderPagination();
  document.querySelector('.enc-container')?.scrollIntoView({behavior:'smooth'});
}

// =========================================
// MODAL SZCZEGÓŁÓW
// =========================================
function openDetail(id) {
  const e = entries.find(x => x.id === id);
  if (!e) return;

  let overlay = document.getElementById('detail-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'detail-overlay';
    overlay.id = 'detail-overlay';
    overlay.innerHTML = `
      <div class="detail-modal">
        <h2 id="d-name"></h2>
        <div id="d-orig" style="font-size:0.78rem;color:var(--ink-faded);font-style:italic;margin-bottom:0.3rem"></div>
        <div class="detail-universe" id="d-universe"></div>
        <div class="detail-tags" id="d-tags"></div>
        <div class="detail-divider"></div>
        <div class="detail-desc" id="d-desc"></div>
        <div class="detail-appearances" id="d-appearances"></div>
        <button class="detail-close" onclick="closeDetail()">✕ Zamknij</button>
        <button class="detail-delete" id="d-delete">🗑️ Usuń (tylko wpisy dodane ręcznie)</button>
      </div>`;
    overlay.addEventListener('click', ev => { if (ev.target === overlay) closeDetail(); });
    document.body.appendChild(overlay);
  }

  document.getElementById('d-name').textContent = e.name;
  document.getElementById('d-orig').textContent =
    e.name_orig && e.name_orig !== e.name ? `✦ oryginalna nazwa: ${e.name_orig}` : '';
  document.getElementById('d-universe').textContent = '🌍 ' + (e.universe || '');

  const tagsEl = document.getElementById('d-tags');
  tagsEl.innerHTML = [
    e.plec && e.plec !== 'brak' ? `<span class="tag">${e.plec}</span>` : '',
    ...(e.tags||[]).map(t => `<span class="tag">${t}</span>`)
  ].join('');

  document.getElementById('d-desc').textContent = e.desc || '';
  const appEl = document.getElementById('d-appearances');
  appEl.innerHTML = e.appearances
    ? `<strong>📍 Pojawia się w:</strong><br>${e.appearances}` : '';

  // Przycisk usuń — tylko dla wpisów dodanych przez użytkownika
  const delBtn = document.getElementById('d-delete');
  const userAdded = JSON.parse(localStorage.getItem(`enc_user_${CATEGORY}`) || '[]');
  const isUserEntry = userAdded.some(u => u.id === id);
  delBtn.style.display = isUserEntry ? 'block' : 'none';
  delBtn.onclick = () => { deleteEntry(id); closeDetail(); };

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  document.getElementById('detail-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

function deleteEntry(id) {
  if (!confirm('Usunąć ten wpis?')) return;
  const userAdded = JSON.parse(localStorage.getItem(`enc_user_${CATEGORY}`) || '[]');
  const updated = userAdded.filter(e => e.id !== id);
  localStorage.setItem(`enc_user_${CATEGORY}`, JSON.stringify(updated));
  entries = entries.filter(e => e.id !== id);
  filtered = getFiltered();
  buildUniverseFilter();
  renderPage();
  renderPagination();
  renderCount();
}

// =========================================
// MODAL DODAWANIA
// =========================================
function openModal() {
  document.getElementById('modal')?.classList.add('open');
}
function closeModal() {
  document.getElementById('modal')?.classList.remove('open');
  ['m-name','m-universe','m-tags','m-desc','m-appearances'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function saveEntry() {
  const name = document.getElementById('m-name')?.value.trim();
  if (!name) { alert('Podaj nazwę!'); return; }

  // Nowe ID = max istniejącego + 1
  const maxId = entries.reduce((m, e) => Math.max(m, e.id||0), 0);
  const newEntry = {
    id: maxId + 1,
    name,
    name_orig: name,
    universe: document.getElementById('m-universe')?.value.trim() || 'Nieznane',
    plec: 'brak',
    tags: (document.getElementById('m-tags')?.value || '').split(',').map(t=>t.trim()).filter(Boolean),
    desc: document.getElementById('m-desc')?.value.trim() || '',
    appearances: document.getElementById('m-appearances')?.value.trim() || '',
  };

  // Zapisz tylko user-added osobno
  const userAdded = JSON.parse(localStorage.getItem(`enc_user_${CATEGORY}`) || '[]');
  userAdded.push(newEntry);
  localStorage.setItem(`enc_user_${CATEGORY}`, JSON.stringify(userAdded));

  entries.push(newEntry);
  closeModal();
  buildUniverseFilter();
  filtered = getFiltered();
  renderPage();
  renderPagination();
  renderCount();
}

// Escape zamyka
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeDetail(); closeModal(); }
});
