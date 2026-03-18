// encyclopedia.js — wspólna logika dla wszystkich stron encyklopedii

let CATEGORY = 'metals';
let entries = [];

// Domyślne dane startowe
const DEFAULTS = {
  metals: [
    { id: 1, name: 'Mithril', universe: 'Tolkien', tags: ['lekki','wytrzymały','magiczny'], desc: 'Niezwykle lekki i wytrzymały metal odkopywany w Khazad-dûm. Cenniejszy od złota.', appearances: 'Władca Pierścieni, Hobbit' },
    { id: 2, name: 'Vibranium', universe: 'Marvel', tags: ['pochłaniający energię','rzadki'], desc: 'Metal meteorytowy z Wakandy. Pochłania i redystrybuuje energię kinetyczną.', appearances: 'Avengers, Black Panther, Captain America' },
    { id: 3, name: 'Valyrian Steel', universe: 'ASOIAF', tags: ['ostry','magiczny','czarny'], desc: 'Stop z Valyrii, stworzony przez smoczy ogień i zaklęcia. Nigdy nie tępieje.', appearances: 'Gra o Tron, Pieśń Lodu i Ognia' },
    { id: 4, name: 'Adamantium', universe: 'Marvel', tags: ['twardy','niezniszczalny'], desc: 'Syntetyczny stop metalu — absolutnie niezniszczalny. Znany z kości Wolverine\'a.', appearances: 'X-Men, Wolverine' },
    { id: 5, name: 'Cold Iron', universe: 'D&D', tags: ['magiczny','anty-fey'], desc: 'Żelazo wydobyte i wykute bez użycia ognia. Skuteczne przeciwko istotom fey.', appearances: 'D&D 5e, mitologia celtycka' },
    { id: 6, name: 'Orichalcum', universe: 'Mitologia', tags: ['złoty','legendarny'], desc: 'Mityczny metal z Atlantydy opisany przez Platona. Drugi co do wartości po złocie.', appearances: 'Kritiasz (Platon), Final Fantasy' },
  ],
  gods: [
    { id: 1, name: 'Zeus', universe: 'Mitologia Grecka', tags: ['bóg piorunów','król bogów'], desc: 'Władca bogów olimpijskich, bóg nieba i piorunów.', appearances: 'Iliada, Odyseja, God of War' },
    { id: 2, name: 'Odyn', universe: 'Mitologia Nordycka', tags: ['mądrość','magia','śmierć'], desc: 'Allfather, król Asów. Poświęcił oko dla mądrości, wisi na Yggdrasil dla run.', appearances: 'Edda Poetycka, Marvel, God of War' },
    { id: 3, name: 'Ao', universe: 'D&D (Faerun)', tags: ['overgod','neutralny'], desc: 'Overdeity Faerunu — jedyne bóstwo stojące ponad innymi bogami. Rzadko ingeruje.', appearances: 'D&D Forgotten Realms' },
  ],
  monsters: [
    { id: 1, name: 'Smok Czerwony', universe: 'D&D', tags: ['ognisty','chciwy','legendarny'], desc: 'Najpotężniejszy i najniebezpieczniejszy typ smoka. Zieje ogniem, kolekcjonuje złoto.', appearances: 'D&D 5e, Hobbit (Smaug)' },
    { id: 2, name: 'Balrog', universe: 'Tolkien', tags: ['ognisty','demoniczny','Maia'], desc: 'Maiar skorumpowani przez Morgotha. Istoty ognia i cienia z biczem ognia.', appearances: 'Władca Pierścieni — Most Khazad-dûm' },
  ],
  'magic-systems': [
    { id: 1, name: 'Magia D&D (Weave)', universe: 'D&D / Forgotten Realms', tags: ['komponentowa','sloty','Mystra'], desc: 'Magia przepływa przez Tkanie (Weave) utrzymywane przez boginię Mystrę. Wymaga komponentów słownych, somatycznych i materialnych.', appearances: 'D&D 5e, Forgotten Realms' },
    { id: 2, name: 'System Hogwartu', universe: 'Harry Potter', tags: ['zaklęcia','różdżka','urodzony'], desc: 'Magia wrodzona wzmacniana różdżką. Zaklęcia łacińskie, magia emocjonalna (Patronus).', appearances: 'Saga Harry Potter' },
    { id: 3, name: 'Allomancy', universe: 'Mistborn (Sanderson)', tags: ['twarda magia','metale','połykanie'], desc: 'Połykanie i spalanie metali daje konkretne zdolności. Jeden z trzech systemów Metalurgii.', appearances: 'Trylogia Mistborn — Brandon Sanderson' },
  ]
};

function initEncyclopedia(category) {
  CATEGORY = category;
  const stored = localStorage.getItem(`enc_${category}`);
  entries = stored ? JSON.parse(stored) : (DEFAULTS[category] || []);
  render();
}

function render() {
  const q = document.getElementById('search')?.value.toLowerCase() || '';
  const uni = document.getElementById('universe-filter')?.value.toLowerCase() || '';

  // Wypełnij filter universe
  const uniSel = document.getElementById('universe-filter');
  if (uniSel && uniSel.options.length <= 1) {
    const universes = [...new Set(entries.map(e => e.universe))].sort();
    universes.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u.toLowerCase(); opt.textContent = u;
      uniSel.appendChild(opt);
    });
  }

  const filtered = entries.filter(e => {
    const matchQ = !q || e.name.toLowerCase().includes(q) || e.desc.toLowerCase().includes(q);
    const matchU = !uni || e.universe.toLowerCase().includes(uni);
    return matchQ && matchU;
  });

  const grid = document.getElementById('grid');
  if (!grid) return;
  grid.innerHTML = filtered.map(e => `
    <div class="entry-card">
      <h4>${e.name}</h4>
      <div class="entry-tags">
        <span class="tag gold">${e.universe}</span>
        ${(e.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
      <p>${e.desc}</p>
      ${e.appearances ? `<div class="entry-origin">📍 ${e.appearances}</div>` : ''}
    </div>
  `).join('');
}

function saveEntries() {
  localStorage.setItem(`enc_${CATEGORY}`, JSON.stringify(entries));
}

function openModal() {
  document.getElementById('modal').classList.add('open');
}
function closeModal() {
  document.getElementById('modal').classList.remove('open');
  ['m-name','m-universe','m-tags','m-desc','m-appearances'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function saveEntry() {
  const name = document.getElementById('m-name')?.value.trim();
  if (!name) { alert('Podaj nazwę!'); return; }
  const newEntry = {
    id: Date.now(),
    name,
    universe: document.getElementById('m-universe')?.value.trim() || 'Nieznane',
    tags: (document.getElementById('m-tags')?.value || '').split(',').map(t => t.trim()).filter(Boolean),
    desc: document.getElementById('m-desc')?.value.trim() || '',
    appearances: document.getElementById('m-appearances')?.value.trim() || '',
  };
  entries.push(newEntry);
  saveEntries();
  closeModal();
  // Reset universe filter
  const sel = document.getElementById('universe-filter');
  if (sel) { sel.innerHTML = '<option value="">Wszystkie światy</option>'; }
  render();
}
