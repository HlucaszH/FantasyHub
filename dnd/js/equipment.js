// equipment.js
const API = 'https://www.dnd5eapi.co/api';
let allItems = [];

async function loadEquipment() {
  try {
    const res = await fetch(`${API}/equipment`);
    const data = await res.json();
    const items = data.results.slice(0, 100);
    const details = await Promise.all(
      items.map(i => fetch(`${API}/equipment/${i.index}`).then(r => r.json()).catch(() => null))
    );
    allItems = details.filter(Boolean);
    document.getElementById('loading').style.display = 'none';
    renderItems(allItems);
  } catch {
    document.getElementById('loading').textContent = '❌ Błąd ładowania API.';
  }
}

function renderItems(items) {
  const grid = document.getElementById('eq-grid');
  if (!grid) return;
  if (items.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:2rem;">Brak wyników</p>';
    return;
  }
  grid.innerHTML = items.map(i => {
    const cost = i.cost ? `${i.cost.quantity} ${i.cost.unit}` : '—';
    const weight = i.weight ? `${i.weight} lb` : '';
    return `
      <div class="eq-card">
        <h4>${i.name}</h4>
        <div class="eq-meta">${i.equipment_category?.name || ''} · ${cost} ${weight ? '· ' + weight : ''}</div>
        <p>${i.desc?.[0] || (i.damage ? `Obrażenia: ${i.damage.damage_dice} ${i.damage.damage_type?.name || ''}` : '')}</p>
      </div>`;
  }).join('');
}

function filterEq() {
  const q = document.getElementById('search').value.toLowerCase();
  const cat = document.getElementById('cat-filter').value.toLowerCase();
  const filtered = allItems.filter(i => {
    const matchQ = !q || i.name.toLowerCase().includes(q);
    const matchCat = !cat || i.equipment_category?.index?.toLowerCase().includes(cat);
    return matchQ && matchCat;
  });
  renderItems(filtered);
}

loadEquipment();
