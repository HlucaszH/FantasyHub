// spells.js — ładuje zaklęcia z D&D 5e API z pełnym modalem
const API = 'https://www.dnd5eapi.co/api';
let allSpells = [];

async function loadSpells() {
  try {
    const res = await fetch(`${API}/spells`);
    const data = await res.json();
    document.getElementById('loading').textContent = `⏳ Ładowanie ${data.results.length} zaklęć...`;
    // Ładuj wszystkie zaklęcia, ale partiami by nie blokować UI
    const chunks = [];
    for (let i = 0; i < data.results.length; i += 20) chunks.push(data.results.slice(i, i+20));
    for (const chunk of chunks) {
      const details = await Promise.all(chunk.map(s => fetch(`${API}/spells/${s.index}`).then(r=>r.json()).catch(()=>null)));
      allSpells.push(...details.filter(Boolean));
    }
    document.getElementById('loading').style.display = 'none';
    renderSpells(allSpells);
  } catch {
    document.getElementById('loading').textContent = '❌ Błąd ładowania API. Sprawdź połączenie z internetem.';
  }
}

function renderSpells(spells) {
  const grid = document.getElementById('spells-grid');
  if (!grid) return;
  if (!spells.length) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--ink-faded);padding:2rem">Brak wyników</p>';
    return;
  }
  grid.innerHTML = spells.map(s => `
    <div class="spell-card" onclick="openSpell('${s.index}')">
      <h4>${s.name}</h4>
      <div class="spell-meta">
        <span class="spell-level-badge">${s.level === 0 ? 'Sztuczka' : `Poziom ${s.level}`}</span>
        ${s.school?.name || ''} · ${s.casting_time || ''}
      </div>
      <p>${s.desc?.[0] || 'Brak opisu'}</p>
      <span class="read-hint">kliknij po szczegóły →</span>
    </div>
  `).join('');
}

function filterSpells() {
  const q = document.getElementById('search').value.toLowerCase();
  const lvl = document.getElementById('level-filter').value;
  const school = document.getElementById('school-filter').value.toLowerCase();
  renderSpells(allSpells.filter(s => {
    return (!q || s.name.toLowerCase().includes(q))
        && (lvl === '' || String(s.level) === lvl)
        && (!school || s.school?.name?.toLowerCase() === school);
  }));
}

function openSpell(index) {
  const s = allSpells.find(x => x.index === index);
  if (!s) return;

  let overlay = document.getElementById('spell-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'spell-detail-overlay';
    overlay.id = 'spell-overlay';
    overlay.innerHTML = `<div class="spell-detail-modal" id="spell-modal"></div>`;
    overlay.addEventListener('click', ev => { if (ev.target === overlay) closeSpell(); });
    document.body.appendChild(overlay);
  }

  const components = (s.components || []).join(', ');
  const material = s.material ? ` (${s.material})` : '';
  const higher = s.higher_level?.length ? `<p style="margin-top:0.75rem;font-style:italic;color:var(--ink-muted)"><strong>Na wyższych poziomach:</strong> ${s.higher_level[0]}</p>` : '';
  const classes = s.classes?.map(c=>c.name).join(', ') || '—';

  document.getElementById('spell-modal').innerHTML = `
    <h2>${s.name}</h2>
    <div class="sd-meta">
      ${s.level === 0 ? 'Sztuczka' : `Zaklęcie ${s.level}. poziomu`} · ${s.school?.name || ''} ${s.ritual ? '· (rytuał)' : ''}
    </div>
    <div class="sd-stats">
      <div class="sd-stat"><span>Czas rzucania: </span><strong>${s.casting_time || '—'}</strong></div>
      <div class="sd-stat"><span>Zasięg: </span><strong>${s.range || '—'}</strong></div>
      <div class="sd-stat"><span>Komponenty: </span><strong>${components}${material}</strong></div>
      <div class="sd-stat"><span>Czas trwania: </span><strong>${s.duration || '—'}</strong></div>
      <div class="sd-stat"><span>Klasy: </span><strong>${classes}</strong></div>
      ${s.concentration ? '<div class="sd-stat"><span>⚠️ </span><strong>Koncentracja</strong></div>' : ''}
    </div>
    <div class="sd-divider"></div>
    <div class="sd-desc">${(s.desc || []).join('<br><br>')}</div>
    ${higher}
    <button class="sd-close" style="margin-top:1.5rem" onclick="closeSpell()">✕ Zamknij</button>
  `;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSpell() {
  document.getElementById('spell-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSpell(); });
loadSpells();
