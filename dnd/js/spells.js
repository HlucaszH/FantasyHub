// spells.js — ładuje zaklęcia z D&D 5e API
const API = 'https://www.dnd5eapi.co/api';
let allSpells = [];

async function loadSpells() {
  try {
    const res = await fetch(`${API}/spells`);
    const data = await res.json();
    // Załaduj szczegóły pierwszych 60 (API rate limit protection)
    const spellList = data.results.slice(0, 120);
    const details = await Promise.all(
      spellList.map(s => fetch(`${API}/spells/${s.index}`).then(r => r.json()).catch(() => null))
    );
    allSpells = details.filter(Boolean);
    document.getElementById('loading').style.display = 'none';
    renderSpells(allSpells);
  } catch (e) {
    document.getElementById('loading').textContent = '❌ Nie udało się załadować API. Sprawdź połączenie.';
  }
}

function renderSpells(spells) {
  const grid = document.getElementById('spells-grid');
  if (!grid) return;
  if (spells.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:2rem;">Brak wyników</p>';
    return;
  }
  grid.innerHTML = spells.map(s => `
    <div class="spell-card">
      <h4>${s.name}</h4>
      <div class="spell-meta">
        <span class="spell-level-badge">${s.level === 0 ? 'Sztuczka' : `Poz. ${s.level}`}</span>
        ${s.school?.name || ''} · ${s.casting_time || ''}
      </div>
      <p>${s.desc?.[0] || 'Brak opisu'}</p>
    </div>
  `).join('');
}

function filterSpells() {
  const q = document.getElementById('search').value.toLowerCase();
  const lvl = document.getElementById('level-filter').value;
  const school = document.getElementById('school-filter').value.toLowerCase();
  const filtered = allSpells.filter(s => {
    const matchQ = !q || s.name.toLowerCase().includes(q);
    const matchLvl = lvl === '' || String(s.level) === lvl;
    const matchSchool = !school || s.school?.name?.toLowerCase() === school;
    return matchQ && matchLvl && matchSchool;
  });
  renderSpells(filtered);
}

loadSpells();
