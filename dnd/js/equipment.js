// equipment.js — ekwipunek z pełnym modalem
const API = 'https://www.dnd5eapi.co/api';
let allItems = [];

async function loadEquipment() {
  try {
    const res = await fetch(`${API}/equipment`);
    const data = await res.json();
    document.getElementById('loading').textContent = `⏳ Ładowanie ${data.results.length} przedmiotów...`;
    const chunks = [];
    for (let i = 0; i < data.results.length; i += 20) chunks.push(data.results.slice(i, i+20));
    for (const chunk of chunks) {
      const details = await Promise.all(chunk.map(i => fetch(`${API}/equipment/${i.index}`).then(r=>r.json()).catch(()=>null)));
      allItems.push(...details.filter(Boolean));
    }
    document.getElementById('loading').style.display = 'none';
    renderItems(allItems);
  } catch {
    document.getElementById('loading').textContent = '❌ Błąd ładowania API.';
  }
}

function renderItems(items) {
  const grid = document.getElementById('eq-grid');
  if (!grid) return;
  if (!items.length) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--ink-faded);padding:2rem">Brak wyników</p>';
    return;
  }
  grid.innerHTML = items.map(i => {
    const cost = i.cost ? `${i.cost.quantity} ${i.cost.unit}` : '—';
    const dmg = i.damage ? `${i.damage.damage_dice} ${i.damage.damage_type?.name||''}` : '';
    return `
      <div class="eq-card" onclick="openItem('${i.index}')">
        <h4>${i.name}</h4>
        <div class="eq-meta">${i.equipment_category?.name||''} · ${cost}${i.weight ? ' · '+i.weight+' lb' : ''}</div>
        <p>${i.desc?.[0] || (dmg ? 'Obrażenia: '+dmg : 'Brak opisu')}</p>
        <span class="read-hint">kliknij po szczegóły →</span>
      </div>`;
  }).join('');
}

function filterEq() {
  const q = document.getElementById('search').value.toLowerCase();
  const cat = document.getElementById('cat-filter').value.toLowerCase();
  renderItems(allItems.filter(i =>
    (!q || i.name.toLowerCase().includes(q)) &&
    (!cat || i.equipment_category?.index?.toLowerCase().includes(cat))
  ));
}

function openItem(index) {
  const i = allItems.find(x => x.index === index);
  if (!i) return;

  let overlay = document.getElementById('eq-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'spell-detail-overlay';
    overlay.id = 'eq-overlay';
    overlay.innerHTML = `<div class="spell-detail-modal" id="eq-modal"></div>`;
    overlay.addEventListener('click', ev => { if (ev.target === overlay) closeItem(); });
    document.body.appendChild(overlay);
  }

  const cost = i.cost ? `${i.cost.quantity} ${i.cost.unit}` : '—';
  const dmg = i.damage ? `<div class="sd-stat"><span>Obrażenia: </span><strong>${i.damage.damage_dice} ${i.damage.damage_type?.name||''}</strong></div>` : '';
  const ac = i.armor_class ? `<div class="sd-stat"><span>Klasa Pancerza: </span><strong>${i.armor_class.base}${i.armor_class.dex_bonus ? ' + DEX' : ''}</strong></div>` : '';
  const props = i.properties?.map(p=>`<span class="spell-level-badge">${p.name}</span>`).join(' ') || '';

  document.getElementById('eq-modal').innerHTML = `
    <h2>${i.name}</h2>
    <div class="sd-meta">${i.equipment_category?.name||''}</div>
    <div class="sd-stats">
      <div class="sd-stat"><span>Cena: </span><strong>${cost}</strong></div>
      ${i.weight ? `<div class="sd-stat"><span>Waga: </span><strong>${i.weight} lb</strong></div>` : ''}
      ${dmg}${ac}
      ${i.armor_class?.stealth_disadvantage ? '<div class="sd-stat" style="color:var(--red)">⚠️ Utrudnienie do Skradania</div>' : ''}
    </div>
    ${props ? `<div style="margin-bottom:1rem">${props}</div>` : ''}
    <div class="sd-divider"></div>
    <div class="sd-desc">${(i.desc||[]).join('<br>') || 'Brak opisu w SRD.'}</div>
    <button class="sd-close" style="margin-top:1.5rem" onclick="closeItem()">✕ Zamknij</button>
  `;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeItem() {
  document.getElementById('eq-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeItem(); });
loadEquipment();
