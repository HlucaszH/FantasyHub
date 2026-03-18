// character.js — Kreator postaci D&D 5e
// Korzysta z darmowego API: https://www.dnd5eapi.co

const API = 'https://www.dnd5eapi.co/api';

const STATS = [
  { id: 'str', label: 'Siła' },
  { id: 'dex', label: 'Zręczność' },
  { id: 'con', label: 'Kondycja' },
  { id: 'int', label: 'Inteligencja' },
  { id: 'wis', label: 'Mądrość' },
  { id: 'cha', label: 'Charyzma' },
];

// Buduj siatki statystyk
const statsGrid = document.getElementById('stats-grid');
if (statsGrid) {
  STATS.forEach(stat => {
    statsGrid.innerHTML += `
      <div class="stat-box">
        <label for="stat-${stat.id}">${stat.label}</label>
        <input type="number" id="stat-${stat.id}" min="1" max="30" value="10"
          oninput="updateModifier('${stat.id}')" />
        <div class="modifier" id="mod-${stat.id}">+0</div>
      </div>`;
  });
}

function updateModifier(id) {
  const val = parseInt(document.getElementById(`stat-${id}`)?.value) || 10;
  const mod = Math.floor((val - 10) / 2);
  const el = document.getElementById(`mod-${id}`);
  if (el) el.textContent = (mod >= 0 ? '+' : '') + mod;
}

// Załaduj klasy z API
async function loadClasses() {
  try {
    const res = await fetch(`${API}/classes`);
    const data = await res.json();
    const sel = document.getElementById('char-class');
    if (!sel) return;
    sel.innerHTML = '<option value="">— wybierz klasę —</option>';
    data.results.forEach(c => {
      sel.innerHTML += `<option value="${c.index}">${c.name}</option>`;
    });
  } catch {
    const sel = document.getElementById('char-class');
    if (sel) sel.innerHTML = '<option>Błąd ładowania API</option>';
  }
}

// Załaduj rasy z API
async function loadRaces() {
  try {
    const res = await fetch(`${API}/races`);
    const data = await res.json();
    const sel = document.getElementById('char-race');
    if (!sel) return;
    sel.innerHTML = '<option value="">— wybierz rasę —</option>';
    data.results.forEach(r => {
      sel.innerHTML += `<option value="${r.index}">${r.name}</option>`;
    });
  } catch {
    const sel = document.getElementById('char-race');
    if (sel) sel.innerHTML = '<option>Błąd ładowania API</option>';
  }
}

// Zbierz dane z formularza
function collectCharacter() {
  const get = id => document.getElementById(id)?.value || '';
  const stats = {};
  STATS.forEach(s => { stats[s.id] = get(`stat-${s.id}`); });
  return {
    name: get('char-name'),
    class: get('char-class'),
    race: get('char-race'),
    background: get('char-background'),
    alignment: get('char-alignment'),
    level: get('char-level'),
    hp_max: get('hp-max'),
    hp_cur: get('hp-cur'),
    ac: get('ac'),
    initiative: get('initiative'),
    speed: get('speed'),
    proficiency: get('proficiency'),
    backstory: get('char-backstory'),
    traits: get('char-traits'),
    ideals: get('char-ideals'),
    bonds: get('char-bonds'),
    flaws: get('char-flaws'),
    equipment: get('char-equipment'),
    notes: get('char-notes'),
    stats
  };
}

// Wypełnij formularz danymi
function fillCharacter(c) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  set('char-name', c.name); set('char-class', c.class); set('char-race', c.race);
  set('char-background', c.background); set('char-alignment', c.alignment);
  set('char-level', c.level); set('hp-max', c.hp_max); set('hp-cur', c.hp_cur);
  set('ac', c.ac); set('initiative', c.initiative); set('speed', c.speed);
  set('proficiency', c.proficiency); set('char-backstory', c.backstory);
  set('char-traits', c.traits); set('char-ideals', c.ideals);
  set('char-bonds', c.bonds); set('char-flaws', c.flaws);
  set('char-equipment', c.equipment); set('char-notes', c.notes);
  if (c.stats) STATS.forEach(s => {
    set(`stat-${s.id}`, c.stats[s.id]);
    updateModifier(s.id);
  });
}

function saveCharacter() {
  const char = collectCharacter();
  const key = `character_${char.name || 'bez_nazwy'}`;
  localStorage.setItem(key, JSON.stringify(char));
  // Też zapisz jako plik JSON
  const blob = new Blob([JSON.stringify(char, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${char.name || 'postac'}.json`;
  a.click();
  alert(`✅ Postać "${char.name || 'bez nazwy'}" zapisana!`);
}

function loadCharacter() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const char = JSON.parse(ev.target.result);
        fillCharacter(char);
        alert(`✅ Wczytano postać: ${char.name || 'bez nazwy'}`);
      } catch {
        alert('❌ Błąd odczytu pliku JSON');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function clearCharacter() {
  if (!confirm('Wyczyścić formularz? Niezapisane dane zostaną utracone.')) return;
  document.querySelectorAll('input[type="text"], textarea').forEach(el => el.value = '');
  document.querySelectorAll('input[type="number"]').forEach(el => el.value = '10');
  document.querySelectorAll('select').forEach(el => el.selectedIndex = 0);
  STATS.forEach(s => updateModifier(s.id));
}

// Inicjalizacja
loadClasses();
loadRaces();
STATS.forEach(s => updateModifier(s.id));
