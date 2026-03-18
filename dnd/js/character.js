// character.js — Pełny kreator postaci D&D 5e (PL)
// Ładuje dane z lokalnych plików JSON

let RASY = [], KLASY = [], TLA = [];
let wybranaRasa = null, wybranaPodrasa = null, wybranaKlasa = null, wybraneTlo = null;

const STAT_NAZWY = ['SIŁ','ZRE','KON','INT','MĄD','CHA'];
const STAT_PELNE = ['Siła','Zręczność','Kondycja','Inteligencja','Mądrość','Charyzma'];
const STAT_IDS   = ['str','dex','con','int','wis','cha'];

// ========== INICJALIZACJA ==========
async function init() {
  try {
    const [r, k, t] = await Promise.all([
      fetch('../data/dnd/rasy.json').then(x=>x.json()),
      fetch('../data/dnd/klasy.json').then(x=>x.json()),
      fetch('../data/dnd/tla.json').then(x=>x.json()),
    ]);
    RASY = r; KLASY = k; TLA = t;
    wypelnijSelecty();
    budujSiatkeStatystyk();
    aktualizujModyfikatory();
  } catch(e) {
    console.error('Błąd ładowania danych:', e);
    document.getElementById('loading-info')?.remove();
  }
}

function wypelnijSelecty() {
  const rasaSel = document.getElementById('char-race');
  const klasaSel = document.getElementById('char-class');
  const tloSel  = document.getElementById('char-background');

  if (rasaSel) {
    rasaSel.innerHTML = '<option value="">— wybierz rasę —</option>';
    RASY.forEach(r => {
      rasaSel.innerHTML += `<option value="${r.index}">${r.name}</option>`;
    });
    rasaSel.addEventListener('change', () => onRasaChange(rasaSel.value));
  }

  if (klasaSel) {
    klasaSel.innerHTML = '<option value="">— wybierz klasę —</option>';
    KLASY.forEach(k => {
      klasaSel.innerHTML += `<option value="${k.index}">${k.ikona} ${k.name}</option>`;
    });
    klasaSel.addEventListener('change', () => onKlasaChange(klasaSel.value));
  }

  if (tloSel) {
    tloSel.innerHTML = '<option value="">— wybierz tło —</option>';
    TLA.forEach(t => {
      tloSel.innerHTML += `<option value="${t.index}">${t.name}</option>`;
    });
    tloSel.addEventListener('change', () => onTloChange(tloSel.value));
  }
}

// ========== RASA ==========
function onRasaChange(index) {
  wybranaRasa = RASY.find(r => r.index === index) || null;
  wybranaPodrasa = null;

  // Podrasa select
  const podrasaDiv = document.getElementById('podrasa-section');
  const podrasaSel = document.getElementById('char-subrace');
  if (podrasaDiv && podrasaSel) {
    if (wybranaRasa && wybranaRasa.podrasy?.length) {
      podrasaDiv.style.display = '';
      podrasaSel.innerHTML = '<option value="">— wybierz podrasę —</option>';
      wybranaRasa.podrasy.forEach(p => {
        podrasaSel.innerHTML += `<option value="${p.index}">${p.name}</option>`;
      });
      podrasaSel.onchange = () => onPodrasaChange(podrasaSel.value);
    } else {
      podrasaDiv.style.display = 'none';
      podrasaSel.innerHTML = '';
    }
  }

  renderInfoRasy();
  aktualizujModyfikatory();
}

function onPodrasaChange(index) {
  if (!wybranaRasa) return;
  wybranaPodrasa = wybranaRasa.podrasy.find(p => p.index === index) || null;
  renderInfoRasy();
  aktualizujModyfikatory();
}

function renderInfoRasy() {
  const div = document.getElementById('rasa-info');
  if (!div) return;
  if (!wybranaRasa) { div.innerHTML = ''; return; }

  const r = wybranaRasa;
  const p = wybranaPodrasa;

  let bonusyHTML = r.bonusy_statystyk.map(b => {
    const label = b.opis || STAT_PELNE[STAT_NAZWY.indexOf(b.stat)] || b.stat;
    return `<span class="tag">${label} +${b.bonus}</span>`;
  }).join('');

  if (p?.bonusy_statystyk) {
    bonusyHTML += p.bonusy_statystyk.map(b =>
      `<span class="tag gold">${STAT_PELNE[STAT_NAZWY.indexOf(b.stat)] || b.stat} +${b.bonus}</span>`
    ).join('');
  }

  const cechy = [...(r.cechy || []), ...(p?.cechy || [])];
  const cechaHTML = cechy.map(c =>
    `<div class="info-cecha"><strong>${c.nazwa}</strong><p>${c.opis}</p></div>`
  ).join('');

  div.innerHTML = `
    <div class="info-box">
      <div class="info-header">
        <h3>${r.name}${p ? ` — ${p.name}` : ''}</h3>
        <div style="font-size:0.85rem;color:var(--ink-muted)">${r.rozmiar} · Szybkość: ${r.szybkosc}m</div>
      </div>
      <p class="info-opis">${p?.opis || r.opis}</p>
      <div class="info-bonusy"><strong>Bonusy statystyk:</strong> ${bonusyHTML}</div>
      <div class="info-cechy">${cechaHTML}</div>
    </div>`;
}

// ========== KLASA ==========
function onKlasaChange(index) {
  wybranaKlasa = KLASY.find(k => k.index === index) || null;
  renderInfoKlasy();
  renderEkwipunekStartowy();
}

function renderInfoKlasy() {
  const div = document.getElementById('klasa-info');
  if (!div) return;
  if (!wybranaKlasa) { div.innerHTML = ''; return; }

  const k = wybranaKlasa;
  const cechaHTML = k.cechy_startowe.map(c =>
    `<div class="info-cecha"><strong>${c.nazwa}</strong><p>${c.opis}</p></div>`
  ).join('');

  div.innerHTML = `
    <div class="info-box">
      <div class="info-header">
        <h3>${k.ikona} ${k.name}</h3>
        <div style="font-size:0.85rem;color:var(--ink-muted)">
          Kość HP: k${k.koscHP} · Główna: ${k.glowna_cecha} · ${k.magik ? '✨ Magik' : '⚔️ Niemagik'}
        </div>
      </div>
      <p class="info-opis">${k.opis}</p>
      <div class="info-row"><strong>Zbroje:</strong> ${k.proficjencje_zbroje}</div>
      <div class="info-row"><strong>Broń:</strong> ${k.proficjencje_bron}</div>
      <div class="info-row"><strong>Umiejętności:</strong> Wybierz ${k.umiejetnosci.ilosc} z: ${Array.isArray(k.umiejetnosci.lista) ? k.umiejetnosci.lista.join(', ') : k.umiejetnosci.lista}</div>
      <div class="info-cechy">${cechaHTML}</div>
    </div>`;
}

// ========== TŁO ==========
function onTloChange(index) {
  wybraneTlo = TLA.find(t => t.index === index) || null;
  renderInfoTla();
  renderEkwipunekStartowy();
}

function renderInfoTla() {
  const div = document.getElementById('tlo-info');
  if (!div) return;
  if (!wybraneTlo) { div.innerHTML = ''; return; }

  const t = wybraneTlo;
  div.innerHTML = `
    <div class="info-box">
      <div class="info-header"><h3>${t.name}</h3></div>
      <p class="info-opis">${t.opis}</p>
      <div class="info-row"><strong>Umiejętności:</strong> ${(t.umiejetnosci||[]).join(', ')}</div>
      ${t.narzedzia ? `<div class="info-row"><strong>Narzędzia:</strong> ${t.narzedzia.join(', ')}</div>` : ''}
      ${t.jezyki ? `<div class="info-row"><strong>Języki:</strong> ${t.jezyki} do wyboru</div>` : ''}
      <div class="info-cecha" style="margin-top:0.75rem">
        <strong>Cecha: ${t.cecha.nazwa}</strong>
        <p>${t.cecha.opis}</p>
      </div>
      ${t.ekwipunek ? `<div class="info-row" style="margin-top:0.5rem"><strong>Ekwipunek startowy tła:</strong><br>${t.ekwipunek.join(', ')}</div>` : ''}
    </div>`;
}

// ========== EKWIPUNEK STARTOWY ==========
function renderEkwipunekStartowy() {
  const div = document.getElementById('ekwipunek-startowy');
  if (!div) return;

  let html = '';
  if (wybranaKlasa?.ekwipunek_startowy?.length) {
    html += '<div class="info-box"><h4 style="font-family:var(--font-heading);color:var(--red);margin-bottom:0.75rem">⚔️ Ekwipunek startowy klasy</h4>';
    wybranaKlasa.ekwipunek_startowy.forEach(e => {
      if (e.stale) {
        html += `<div class="info-row"><strong>${e.kategoria}:</strong> ${e.stale.join(', ')}</div>`;
      } else if (e.opcje) {
        html += `<div class="info-row"><strong>${e.kategoria}:</strong> `;
        html += `<select class="ekw-choice" style="display:inline;width:auto">`;
        e.opcje.forEach(o => html += `<option>${o}</option>`);
        html += `</select></div>`;
      }
    });
    html += '</div>';
  }

  if (wybraneTlo?.ekwipunek?.length) {
    html += `<div class="info-box" style="margin-top:0.75rem"><h4 style="font-family:var(--font-heading);color:var(--red);margin-bottom:0.5rem">🎒 Ekwipunek z tła</h4>
      <div class="info-row">${wybraneTlo.ekwipunek.join(', ')}</div></div>`;
  }

  div.innerHTML = html || '<p style="color:var(--ink-faded);font-style:italic">Wybierz klasę i tło by zobaczyć ekwipunek startowy.</p>';
}

// ========== STATYSTYKI ==========
function budujSiatkeStatystyk() {
  const grid = document.getElementById('stats-grid');
  if (!grid) return;
  grid.innerHTML = STAT_IDS.map((id, i) => `
    <div class="stat-box">
      <label for="stat-${id}">${STAT_PELNE[i]}</label>
      <div style="font-size:0.65rem;color:var(--ink-faded);font-family:var(--font-heading)">${STAT_NAZWY[i]}</div>
      <input type="number" id="stat-${id}" min="1" max="30" value="10"
        oninput="aktualizujModyfikatory()" />
      <div class="modifier" id="mod-${id}">+0</div>
      <div class="stat-bonus-rasy" id="rbonus-${id}" style="font-size:0.65rem;color:var(--red);min-height:0.8rem"></div>
    </div>`).join('');
}

function aktualizujModyfikatory() {
  STAT_IDS.forEach((id, i) => {
    const val = parseInt(document.getElementById(`stat-${id}`)?.value) || 10;
    const mod = Math.floor((val - 10) / 2);
    const el = document.getElementById(`mod-${id}`);
    if (el) el.textContent = (mod >= 0 ? '+' : '') + mod;

    // Pokaż bonus rasowy
    const rEl = document.getElementById(`rbonus-${id}`);
    if (rEl) {
      let bonus = 0;
      const statNazwa = STAT_NAZWY[i];
      if (wybranaRasa) {
        wybranaRasa.bonusy_statystyk.forEach(b => { if (b.stat === statNazwa) bonus += b.bonus; });
      }
      if (wybranaPodrasa) {
        wybranaPodrasa.bonusy_statystyk?.forEach(b => { if (b.stat === statNazwa) bonus += b.bonus; });
      }
      rEl.textContent = bonus > 0 ? `rasa: +${bonus}` : '';
    }
  });
}

// ========== METODY TWORZENIA STATYSTYK ==========

// Standard Array: 15, 14, 13, 12, 10, 8
const STANDARD = [15, 14, 13, 12, 10, 8];
let standardUzyte = [false,false,false,false,false,false];

function wybierzMetodeStatystyk(metoda) {
  document.querySelectorAll('.metoda-btn').forEach(b => b.classList.remove('aktywna'));
  document.getElementById(`metoda-${metoda}`)?.classList.add('aktywna');

  document.getElementById('stat-losowanie').style.display = metoda === 'losowanie' ? '' : 'none';
  document.getElementById('stat-standard').style.display = metoda === 'standard' ? '' : 'none';
  document.getElementById('stat-punkty').style.display = metoda === 'punkty' ? '' : 'none';
}

// --- RZUT KOŚĆMI ---
function rzucajStatystyki() {
  STAT_IDS.forEach(id => {
    const wyniki = Array.from({length:4}, () => Math.floor(Math.random()*6)+1).sort((a,b)=>b-a);
    const suma = wyniki.slice(0,3).reduce((a,b)=>a+b,0);
    const input = document.getElementById(`stat-${id}`);
    if (input) {
      input.value = suma;
      // Animacja
      input.style.color = 'var(--red)';
      setTimeout(() => { input.style.color = ''; }, 600);
    }
  });
  aktualizujModyfikatory();
  document.getElementById('roll-historia').textContent = 'Rzut wykonany! Wyniki powyżej.';
}

// --- STANDARD ARRAY ---
function budujStandardArray() {
  standardUzyte = [false,false,false,false,false,false];
  const div = document.getElementById('standard-grid');
  if (!div) return;
  div.innerHTML = STAT_IDS.map((id,i) => `
    <div class="standard-row">
      <label style="font-family:var(--font-heading);font-size:0.8rem;width:90px">${STAT_PELNE[i]}</label>
      <select id="std-${id}" onchange="przydzielStandard()">
        <option value="">—</option>
        ${STANDARD.map(v => `<option value="${v}">${v}</option>`).join('')}
      </select>
    </div>`).join('');
}

function przydzielStandard() {
  const wartosci = {};
  STAT_IDS.forEach(id => {
    const v = document.getElementById(`std-${id}`)?.value;
    if (v) wartosci[id] = parseInt(v);
  });

  // Sprawdź duplikaty
  const uzyte = Object.values(wartosci);
  const duplikaty = uzyte.filter((v,i) => uzyte.indexOf(v) !== i);

  // Zaznacz błędne
  STAT_IDS.forEach(id => {
    const sel = document.getElementById(`std-${id}`);
    if (!sel) return;
    const v = parseInt(sel.value);
    const isDup = duplikaty.includes(v) && sel.value !== '';
    sel.style.borderColor = isDup ? 'var(--red)' : '';
  });

  if (!duplikaty.length) {
    STAT_IDS.forEach(id => {
      const v = wartosci[id];
      if (v) {
        const input = document.getElementById(`stat-${id}`);
        if (input) input.value = v;
      }
    });
    aktualizujModyfikatory();
  }
}

// --- SYSTEM PUNKTOWY (Point Buy) ---
// Koszty: 8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=7, 15=9
const KOSZTY_PUNKTOW = {8:0, 9:1, 10:2, 11:3, 12:4, 13:5, 14:7, 15:9};
const PULA_PUNKTOW = 27;

function budujSystemPunktowy() {
  const div = document.getElementById('punkty-grid');
  if (!div) return;
  div.innerHTML = STAT_IDS.map((id, i) => `
    <div class="punkty-row">
      <label style="font-family:var(--font-heading);font-size:0.8rem;width:90px">${STAT_PELNE[i]}</label>
      <button onclick="zmienPunkty('${id}',-1)" class="dice-btn" style="padding:0.2rem 0.6rem">−</button>
      <span id="pv-${id}" style="font-family:var(--font-heading);font-size:1.1rem;color:var(--red);min-width:2rem;text-align:center">8</span>
      <button onclick="zmienPunkty('${id}',+1)" class="dice-btn" style="padding:0.2rem 0.6rem">+</button>
      <span style="font-size:0.8rem;color:var(--ink-muted)">koszt: <span id="pk-${id}">0</span></span>
    </div>`).join('') + `<div id="punkty-pozostale" style="margin-top:0.75rem;font-family:var(--font-heading);font-size:0.95rem;color:var(--red)">Punkty: <strong>${PULA_PUNKTOW}/${PULA_PUNKTOW}</strong></div>`;

  STAT_IDS.forEach(id => {
    document.getElementById(`pv-${id}`).dataset.val = 8;
  });
  aktualizujPunkty();
}

function zmienPunkty(id, delta) {
  const el = document.getElementById(`pv-${id}`);
  if (!el) return;
  let val = parseInt(el.dataset.val || 8);
  val = Math.max(8, Math.min(15, val + delta));

  // Sprawdź czy stać
  el.dataset.val = val;
  const wydane = STAT_IDS.reduce((sum, sid) => {
    const v = parseInt(document.getElementById(`pv-${sid}`)?.dataset.val || 8);
    return sum + (KOSZTY_PUNKTOW[v] || 0);
  }, 0);

  if (wydane > PULA_PUNKTOW) {
    el.dataset.val = val - delta; // cofnij
    return;
  }

  aktualizujPunkty();
}

function aktualizujPunkty() {
  let wydane = 0;
  STAT_IDS.forEach(id => {
    const val = parseInt(document.getElementById(`pv-${id}`)?.dataset.val || 8);
    const koszt = KOSZTY_PUNKTOW[val] || 0;
    wydane += koszt;
    const pvEl = document.getElementById(`pv-${id}`);
    const pkEl = document.getElementById(`pk-${id}`);
    const statInput = document.getElementById(`stat-${id}`);
    if (pvEl) pvEl.textContent = val;
    if (pkEl) pkEl.textContent = koszt;
    if (statInput) statInput.value = val;
  });
  const pozostale = PULA_PUNKTOW - wydane;
  const infoEl = document.getElementById('punkty-pozostale');
  if (infoEl) {
    infoEl.innerHTML = `Pozostało punktów: <strong style="color:${pozostale<0?'red':''}">${pozostale}/${PULA_PUNKTOW}</strong>`;
  }
  aktualizujModyfikatory();
}

// ========== ZAPIS / WCZYTAJ / WYCZYŚĆ ==========
function collectCharacter() {
  const get = id => document.getElementById(id)?.value || '';
  const stats = {};
  STAT_IDS.forEach(id => { stats[id] = get(`stat-${id}`); });
  return {
    name: get('char-name'),
    klasa: wybranaKlasa?.name || get('char-class'),
    rasa: wybranaRasa?.name || get('char-race'),
    podrasa: wybranaPodrasa?.name || '',
    tlo: wybraneTlo?.name || get('char-background'),
    wyrownanie: get('char-alignment'),
    poziom: get('char-level'),
    hp_max: get('hp-max'), hp_cur: get('hp-cur'),
    ac: get('ac'), inicijatywa: get('initiative'),
    szybkosc: get('speed'), bieglosc: get('proficiency'),
    historia: get('char-backstory'), cechy: get('char-traits'),
    idealy: get('char-ideals'), wiezi: get('char-bonds'),
    slabosci: get('char-flaws'), ekwipunek: get('char-equipment'),
    notatki: get('char-notes'), stats,
  };
}

function fillCharacter(c) {
  const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
  set('char-name', c.name); set('char-alignment', c.wyrownanie);
  set('char-level', c.poziom); set('hp-max', c.hp_max); set('hp-cur', c.hp_cur);
  set('ac', c.ac); set('initiative', c.inicijatywa);
  set('speed', c.szybkosc); set('proficiency', c.bieglosc);
  set('char-backstory', c.historia); set('char-traits', c.cechy);
  set('char-ideals', c.idealy); set('char-bonds', c.wiezi);
  set('char-flaws', c.slabosci); set('char-equipment', c.ekwipunek);
  set('char-notes', c.notatki);
  if (c.stats) STAT_IDS.forEach(id => { set(`stat-${id}`, c.stats[id]); });

  if (c.klasa) {
    const sel = document.getElementById('char-class');
    const k = KLASY.find(k => k.name === c.klasa);
    if (sel && k) { sel.value = k.index; onKlasaChange(k.index); }
  }
  if (c.rasa) {
    const sel = document.getElementById('char-race');
    const r = RASY.find(r => r.name === c.rasa);
    if (sel && r) { sel.value = r.index; onRasaChange(r.index); }
  }
  aktualizujModyfikatory();
}

function saveCharacter() {
  const char = collectCharacter();
  const blob = new Blob([JSON.stringify(char, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${char.name || 'postac'}.json`;
  a.click();
  alert(`✅ Postać "${char.name || 'bez nazwy'}" zapisana!`);
}

function loadCharacter() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = ev => {
      try { fillCharacter(JSON.parse(ev.target.result)); }
      catch { alert('❌ Błąd odczytu pliku JSON'); }
    };
    reader.readAsText(file);
  };
  input.click();
}

function clearCharacter() {
  if (!confirm('Wyczyścić formularz?')) return;
  document.querySelectorAll('input[type="text"], textarea').forEach(el => el.value = '');
  document.querySelectorAll('input[type="number"]').forEach(el => el.value = '10');
  document.querySelectorAll('select').forEach(el => el.selectedIndex = 0);
  wybranaRasa = null; wybranaPodrasa = null; wybranaKlasa = null; wybraneTlo = null;
  ['rasa-info','klasa-info','tlo-info','ekwipunek-startowy'].forEach(id => {
    const el = document.getElementById(id); if (el) el.innerHTML = '';
  });
  aktualizujModyfikatory();
}

// Klawisz Escape zamyka modale
document.addEventListener('keydown', e => { if (e.key === 'Escape') {} });

init();
