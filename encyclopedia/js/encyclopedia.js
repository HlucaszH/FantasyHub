// encyclopedia.js — pełna logika encyklopedii z modalami

let CATEGORY = 'metals';
let entries = [];

// =========================================
// PEŁNA BAZA DANYCH STARTOWYCH
// =========================================
const DEFAULTS = {
  metals: [
    { id:1,  name:'Mithril',         universe:'Tolkien',              tags:['lekki','wytrzymały','magiczny'],         desc:'Niezwykle lekki i wytrzymały metal odkopywany w Khazad-dûm (Moria). Cenniejszy od złota, lśniący jak srebro lecz twardszy od kutego żelaza. Z mithrilem wykuta jest koszulka kolcza Bilba i Froda.', appearances:'Władca Pierścieni, Hobbit — J.R.R. Tolkien' },
    { id:2,  name:'Vibranium',       universe:'Marvel',               tags:['energia kinetyczna','rzadki','Wakanda'], desc:'Metal meteorytowy wyłącznie z Wakandy. Pochłania i redystrybuuje energię kinetyczną — uniemożliwiając przebicie go. Z vibranium wykonana jest tarcza Kapitana Ameryki. Istnieje też odmianka anty-metalowego vibranium z Antarktydy, która rozkłada inne metale.', appearances:'Captain America, Black Panther, Avengers — Marvel Comics/MCU' },
    { id:3,  name:'Valyrian Steel',  universe:'ASOIAF / Gra o Tron',  tags:['ostry','magiczny','smoczy ogień'],       desc:'Stop stworzony przez smoczy ogień i zaklęcia w Starym Valyrii. Nigdy się nie tępi, jest lżejszy i mocniejszy od zwykłej stali, często faluje jak damaszt. Tajemnica wytopu zaginęła wraz z Zagładą Valyrii 400 lat przed akcją powieści. Jedyny materiał obok obsydianu (smoczego szkła) zdolny zabić Innych.', appearances:'Gra o Tron — HBO; Pieśń Lodu i Ognia — George R.R. Martin' },
    { id:4,  name:'Adamantium',      universe:'Marvel',               tags:['twardy','niezniszczalny','syntetyczny'], desc:'Syntetyczny stop metalu — praktycznie absolutnie niezniszczalny. Stworzony przez rząd USA w ramach projektu Weapon X. Znany przede wszystkim z pokrytego nim szkieletu i szponów Wolverine\'a. Proto-adamantium, z którego wykonana jest tarcza Kapitana Ameryki, jest silniejsze niż standardowe adamantium.', appearances:'X-Men, Wolverine, Avengers — Marvel Comics' },
    { id:5,  name:'Cold Iron',       universe:'D&D / Folklor',        tags:['anty-fey','żelazo','rytualne'],         desc:'Żelazo wydobyte i wykute bez użycia ognia — w całości zimnym procesem. Skuteczne przeciwko istotom fey, diabłom i demonom. Siła pochodzi z braku "skażenia" ogniem, który w wielu tradycjach jest żywiołem fey. W D&D 5e jest to specjalny materiał broni.', appearances:'D&D 5e, mitologia celtycka, folklor europejski' },
    { id:6,  name:'Orichalcum',      universe:'Mitologia / gry',      tags:['legendarny','atlantydzki','złoty'],      desc:'Mityczny metal z Atlantydy opisany przez Platona w dialogu "Kritiasz". Drugi co do wartości po złocie, lśnił czerwono-złotym blaskiem. W grach często pojawia się jako rzadki surowiec do tworzenia najlepszego ekwipunku.', appearances:'Kritiasz — Platon; Final Fantasy (seria); God of War' },
    { id:7,  name:'Uru',             universe:'Marvel (nordycki)',     tags:['magiczny','boski','nordycki'],          desc:'Metal z nordyckiej mitologii Marvela, wykopywany w Nidavellir — królestwie krasnoludów. Z uru wykuto Mjolnir (młot Thora), Stormbreaker oraz zbroję Thora. Metal pochodzi z umierającej gwiazdy i jest naturalnie magiczny.', appearances:'Thor, Avengers: Infinity War — Marvel Comics/MCU' },
    { id:8,  name:'Mana Steel',      universe:'Trylogia Sowiego Maga', tags:['magiczny','mana','polska fantastyka'],  desc:'Metal nasycony maną, używany do tworzenia magicznych broni i artefaktów w świecie Sowiego Maga. Wymaga zarówno umiejętności kowalskich jak i magicznych do obróbki.', appearances:'Trylogia Sowiego Maga' },
    { id:9,  name:'Obsidian (Dragon Glass)', universe:'ASOIAF',       tags:['smoczy oddech','Inni','wulkaniczny'],    desc:'Zwane też smoczyim szkłem lub smoczym kamieniem. Naturalny obsydian o magicznych właściwościach — jeden z dwóch materiałów zdolnych zabić Innych (White Walkers). Wielkie złoża znajdują się na Dragonstone.', appearances:'Pieśń Lodu i Ognia — George R.R. Martin' },
    { id:10, name:'Dragonbone',      universe:'ASOIAF',               tags:['smok','lekki','wytrzymały'],            desc:'Kości smocze — czarne, lekkie i twardsze od stali. Używane do wyrobu łuków i broni przez Dothraków i lud Letnich Wysp. Niezwykle drogie i rzadkie.', appearances:'Gra o Tron — HBO; Pieśń Lodu i Ognia' },
    { id:11, name:'Meteoric Iron',   universe:'D&D / Warhammer',      tags:['meteoryt','magiczny','kosmiczny'],      desc:'Żelazo z meteorytów. W wielu systemach uważane za naturalnie magiczne ze względu na pozaziemskie pochodzenie. W Warhammer Fantasy używane do tworzenia najlepszych ostrzy, bo "dotknięte przez bogów".', appearances:'D&D, Warhammer Fantasy Roleplay' },
    { id:12, name:'Stygian Iron',    universe:'D&D (Planescape)',      tags:['piekło','demoniczny','anty-astral'],    desc:'Metal wykuty w Styksie lub pobliskich planach. Działa bezpośrednio na duszę — rany nim zadane goją się znacznie wolniej lub wcale. Skuteczny przeciwko duchom i nieumarłym.', appearances:'D&D Planescape' },
  ],

  gods: [
    { id:1,  name:'Zeus',            universe:'Mitologia Grecka',     tags:['pioruny','niebo','król bogów'],         desc:'Władca bogów olimpijskich i król Olimpu. Bóg nieba, piorunów i porządku. Syn Kronosa i Rei — obalił ojca by przejąć władzę. Znany z licznych romansów ze śmiertelniczkami, które rodziły bohaterów (Herakles, Perseus). Atrybuty: piorun, orzeł, berło.', appearances:'Iliada, Odyseja — Homer; God of War (seria); Hades (gra Supergiant)' },
    { id:2,  name:'Odyn',            universe:'Mitologia Nordycka',   tags:['mądrość','magia','Allfather','runy'],   desc:'Allfather — ojciec i król Asów w Asgardzie. Bóg mądrości, magii, śmierci i poezji. Poświęcił oko w studni Mimira dla mądrości; wisiał 9 dni na Yggdrasil by poznać runy. Posiada dwa kruki (Huginn i Muninn) i dwa wilki. Ginie z ręki Fenrira podczas Ragnaroku.', appearances:'Edda Poetycka, Edda Prozaiczna; Marvel Thor; God of War: Ragnarök' },
    { id:3,  name:'Ao',              universe:'D&D — Forgotten Realms', tags:['overgod','neutralny','Faerun'],       desc:'Overdeity Faerunu — jedyne bóstwo stojące absolutnie ponad wszystkimi innymi bogami, tytanami i istotami boskimi. Rzadko ingeruje w świat śmiertelników. Powołał do życia Mystrę po śmierci poprzedniej bogini magii. Wyznaje zasadę, że bogowie są sługami wiernych, nie odwrotnie.', appearances:'D&D Forgotten Realms; Baldur\'s Gate (seria); Neverwinter Nights' },
    { id:4,  name:'Mystra',          universe:'D&D — Forgotten Realms', tags:['magia','Weave','Faerun','bogini'],    desc:'Bogini magii w Faerunie — utrzymuje Tkanie (Weave), mistyczną sieć przez którą przepływa cała magia. Bez Mystry rzucanie zaklęć jest niemożliwe lub śmiertelnie niebezpieczne. Była zabita trzykrotnie i trzykrotnie odradzała się w nowej awatarce. Kapłani Mystry to często czarodzieje i wiedźmy.', appearances:'D&D Forgotten Realms; Baldur\'s Gate 3; Neverwinter Nights' },
    { id:5,  name:'Thor',            universe:'Mitologia Nordycka / Marvel', tags:['pioruny','siła','Mjolnir','Asgard'], desc:'Syn Odyna i Jord (Ziemi), bóg piorunów, siły i ochrony ludzkości. Dzierży Mjolnir — młot mogący być podniesiony tylko przez godnych. Wróg Węża Midgardu (Jormungand), z którym wzajemnie się zabijają podczas Ragnaroku. W Marvelu — superbohater i członek Avengers.', appearances:'Edda Poetycka; Thor (Marvel/MCU); God of War: Ragnarök' },
    { id:6,  name:'Lolth',           universe:'D&D — Forgotten Realms', tags:['pająki','drow','chaos','zło'],        desc:'Pajęcza Królowa, bogini Drow i pająków. Rządzi Demonweb Pits w Otchłani (Abyss). Kapłanki Lolth mają absolutną władzę nad społeczeństwem drow — są matriarchatem. Wyznawcy muszą nieustannie udowadniać swą wartość lub zostać poświęceni bogini. Jedna z najpotężniejszych bóstw zła w Faerunie.', appearances:'D&D Forgotten Realms; Baldur\'s Gate 3; Menzoberranzan' },
    { id:7,  name:'Tyr',             universe:'D&D / Mitologia Nordycka', tags:['sprawiedliwość','prawo','Asgard'],  desc:'Bóg sprawiedliwości i prawa — zarówno w mitologii nordyckiej jak i w Forgotten Realms. Stracił rękę gdy wkładał ją w paszczę Fenrira jako zastaw (wiedząc że zostanie ugryziony) by bogowie mogli zakuć wilka. Symbol poświęcenia dla dobra prawa.', appearances:'D&D Forgotten Realms; mitologia nordycka; God of War: Ragnarök' },
    { id:8,  name:'Shar',            universe:'D&D — Forgotten Realms', tags:['ciemność','tajemnice','ból','zło'],   desc:'Bogini ciemności, tajemnic i zapomnienia. Siostra bliźniaczka Selune (bogini księżyca) — ich wieczny konflikt jest fundamentem kosmologii Faerunu. Twórczyni Ciemności (Shade Weave) — alternatywnej, skażonej wersji Tkania Mystry. Jej wyznawcy szukają wiedzy zakazanej i niszczą światło.', appearances:'D&D Forgotten Realms; Baldur\'s Gate 3' },
    { id:9,  name:'Ra',              universe:'Mitologia Egipska',    tags:['słońce','stworzenie','król bogów'],     desc:'Bóg słońca i stworzenia — najważniejsze bóstwo panteonu egipskiego. Każdego dnia przemierzał niebo swoją łódką słoneczną, a nocą podróżował przez Duat (zaświaty) walcząc z wężem Apopem. Często łączony z Horusem jako Ra-Horachty.', appearances:'Mitologia Egipska; Smite (gra); Age of Mythology' },
    { id:10, name:'Loki',            universe:'Mitologia Nordycka / Marvel', tags:['oszust','magia','zmiennokształtny'], desc:'Bóg oszustwa i zmiany kształtu. Syn olbrzyma Farbauti, adoptowany przez Asów. Sprawca śmierci Baldura przez podstęp — za co został zakuty do skały aż do Ragnaroku. Ojciec Fenrira, Jormunganda i Hel. W Marvelu — brat Thora, wielokrotny antagonista i antybohater.', appearances:'Edda Poetycka; Loki (Marvel/MCU); God of War: Ragnarök' },
    { id:11, name:'Kelemvor',        universe:'D&D — Forgotten Realms', tags:['śmierć','sprawiedliwość','neutralny'], desc:'Bóg śmierci i zaświatów w Faerunie. W przeciwieństwie do Myrkulia (poprzedniego boga śmierci) nie jest zły — jest sprawiedliwym sędzią dusz. Zapewnia, że każda dusza trafia we właściwe miejsce. Nienawidzi nieumarłych jako zbrukania naturalnego porządku śmierci.', appearances:'D&D Forgotten Realms; Baldur\'s Gate 3' },
    { id:12, name:'Selûne',          universe:'D&D — Forgotten Realms', tags:['księżyc','magia','dobro','siostra'],  desc:'Bogini księżyca i nawigacji. Wieczna rywalka swojej siostry Shar (bogini ciemności). Jej wyznawcy — Moonhunt — walczą z likantropia i ciemnością. Związana z Mystrą przez naturę magii księżycowej. Jedna z najstarszych bóstw Faerunu.', appearances:'D&D Forgotten Realms; Baldur\'s Gate 3' },
  ],

  monsters: [
    { id:1,  name:'Smok Czerwony (Red Dragon)', universe:'D&D 5e',   tags:['ognisty','chciwy','legendarny','CR 24'], desc:'Najpotężniejszy i najniebezpieczniejszy typ smoka chromatycznego. Zieje ogniem w stożku 90 stóp. Wyjątkowo chciwy — obsesyjnie gromadzi złoto. Dorosły smok czerwony to wyzwanie klasy CR 17, starożytny — CR 24. Inteligentny i narcystyczny.', appearances:'D&D 5e (Monster Manual); Hobbit (Smaug — J.R.R. Tolkien)' },
    { id:2,  name:'Balrog (Durin\'s Bane)',      universe:'Tolkien',  tags:['ognisty','demoniczny','Maia','Most'],   desc:'Maiar — angielskie duchy — skorumpowane przez Morgotha. Istoty ognia i cienia z biczem płomienia. Durin\'s Bane był balrogiem, który zabił Duryna VI i grasował w Morii przez wieki aż Drużyna Pierścienia go napotkała. Gandalf pokonał go po dziesięciodniowej walce.', appearances:'Władca Pierścieni — J.R.R. Tolkien; filmy Petera Jacksona' },
    { id:3,  name:'Beholder',                    universe:'D&D 5e',  tags:['antymagia','latający','CR 13','oczy'],   desc:'Sfera mięsa z centralnym okiem antymagii i 10 mniejszymi oczami na łodygach — każde ze specjalnym promieniem (dezintegracja, strach, telekineza, kamieniowanie, uśpienie, urok, wytracenie magii, spowalnianie, śmierć, uwięzienie). Paranoiczne istoty nienawidzące wszystkiego — łącznie z innymi beholderami.', appearances:'D&D 5e Monster Manual (icon monster); Baldur\'s Gate 3' },
    { id:4,  name:'Lich',                        universe:'D&D 5e',  tags:['nieumarły','czarownik','fylakteria','CR 21'], desc:'Potężny czarownik lub wiedźma, który poddał się rytuałowi nieśmiertelności — stając się nieumarłym. Jego dusza jest zamknięta w fylakterii (magicznym pojemniku). Dopóki fylakteria istnieje, lich odrodzi się po zabciu. Zachowuje pełną inteligencję i zdolności magiczne.', appearances:'D&D 5e Monster Manual; Acererak (Tomb of Annihilation)' },
    { id:5,  name:'Mind Flayer (Illithid)',       universe:'D&D 5e',  tags:['telepatia','pożeracz mózgów','Underdark','CR 7'], desc:'Humanoidalne stworzenia z ośmiornicowatą głową żyją w Underdark. Żywią się mózgami innych istot, mają potężne zdolności psioniczne (telepatia, tworzenie iluzji, ogłuszający blast mentalny). Rządzeni przez Elder Brain — ogromny mózg telepatycznie kontrolujący kolonie.', appearances:'D&D 5e Monster Manual; Baldur\'s Gate 3' },
    { id:6,  name:'Tarrasque',                   universe:'D&D 5e',  tags:['CR 30','uniszczalny','katastrofa','legendarny'], desc:'Najpotężniejszy potwór w D&D 5e — CR 30. 70 stóp wysokości, 50 stóp szerokości. Może pochłaniać zaklęcia (Legendary Resistance 3/dzień). Regeneruje HP, odporna na wiele typów obrażeń. Śpi pod ziemią przez wieki i budzi się by niszczyć cywilizacje. Zabić ją można — ale nie da się jej zniszczyć na stałe.', appearances:'D&D 5e Monster Manual' },
    { id:7,  name:'Wampir (Vampire)',             universe:'D&D / folklor', tags:['nieumarły','charyzma','nieśmiertelny','CR 13'], desc:'Nieumarłe stworzenie odżywiające się krwią żywych. W D&D wampiry zachowują całą swoją inteligencję i zdolności — plus nabywają nowe: urok, zmiana kształtu, odporności. Tworzą miniony (Vampire Spawn). Wrażliwe na słońce, bieżącą wodę, święte symbole i drewniane kołki.', appearances:'D&D 5e; Strahd von Zarovich (Curse of Strahd); Dracula — Bram Stoker' },
    { id:8,  name:'Aboleth',                     universe:'D&D 5e',  tags:['starożytny','telepatia','Underdark','CR 10'], desc:'Pradawne stworzenia sprzed narodzin bogów — żyją w Underdark w wodach podziemnych. Posiadają pamięć każdego życia (swojego i swoich przodków). Uważają się za prawdziwych władców świata. Mogą zmienić śmiertelnika w sługę przez kontakt ze swoją śluzą.', appointments:'D&D 5e Monster Manual', appearances:'D&D 5e Monster Manual' },
  ],

  'magic-systems': [
    { id:1,  name:'Magia D&D — Weave',         universe:'D&D / Forgotten Realms', tags:['sloty','komponenty','Mystra','Weave'],   desc:'Magia w Faerunie przepływa przez Tkanie (Weave) — mistyczną sieć utrzymywaną przez Mystrę. Czarownicy uczą się zaklęć przez naukę, kapłani dostają je od bogów, bard\'owie przez inspirację. Zaklęcia wymagają komponentów: V (słowny), S (somatyczny), M (materialny). System slotów limituje ile zaklęć można rzucić dziennie.', appearances:'D&D 5e; Forgotten Realms; Baldur\'s Gate 3' },
    { id:2,  name:'Magia Hogwartu',            universe:'Harry Potter',            tags:['różdżka','zaklęcia','łacina','wrodzona'], desc:'Magia jest wrodzona — dzieci czarodziejów rodzą się z mocą (lub nie — wówczas są mugolami/błotnorodzeni). Różdżka służy jako fokus i wzmacniacz. Zaklęcia oparte na łacinie (Expelliarmus, Avada Kedavra). Ważne są emocje — Patronus wymaga radosnego wspomnienia, Cruciatus — prawdziwej chęci zadawania bólu.', appearances:'Saga Harry Potter — J.K. Rowling; Fantastyczne Zwierzęta' },
    { id:3,  name:'Allomancy (Mistborn)',       universe:'Mistborn — Sanderson',    tags:['metale','połykanie','twarda','Sanderson'], desc:'Jeden z trzech systemów Metalurgii Branda Sandersona. Allomanci połykają i spalają metale, uzyskując konkretne zdolności: stal odpycha metale, żelazo przyciąga, cynk wzmacnia emocje innych, miedź tłumi allomancję w pobliżu. Mistborn mogą używać wszystkich 16 metali.', appearances:'Trylogia Mistborn — Brandon Sanderson' },
    { id:4,  name:'Feruchemia (Mistborn)',      universe:'Mistborn — Sanderson',    tags:['metale','przechowywanie','Sanderson'],    desc:'Drugi system Metalurgii. Feruchemiści używają metalowych bransolet (metalminds) do przechowywania atrybutów — np. przechowują siłę przez tydzień by potem wyciągnąć ją w jednej chwili. Glin przechowuje pamięć, cynk inteligencję, cyna zdrowie. System zero-sum — musisz coś poświęcić by zyskać.', appearances:'Trylogia Mistborn — Brandon Sanderson' },
    { id:5,  name:'Bendowanie żywiołów',        universe:'Avatar (Airbender)',      tags:['żywioły','chi','walki','Awatar'],          desc:'Bendowanie to zdolność telekinetycznego kontrolowania jednego z czterech żywiołów (ogień, woda, ziemia, powietrze). Każdy naród ma swój żywioł. Tylko Awatar może bendować wszystkie cztery. System oparty na realnych stylach walki: Air = Baguazhang, Water = Tai Chi, Earth = Hung Gar, Fire = Capoeira.', appearances:'Avatar: Legenda Aanga; Legenda Korry' },
    { id:6,  name:'Magia Mistycznych Sztuk',    universe:'Marvel',                  tags:['wymiary','runy','Kamar-Taj','Doktor Strange'], desc:'Czerpanie energii z innych wymiarów przez mandale i zaklęcia runiczne. Uczniowie szkolą się w Kamar-Taj (Nepal). Najwyższy Czarownik (Sorcerer Supreme) chroni Ziemię przed zagrożeniami z innych wymiarów. Wyższe poziomy pozwalają na manipulację czasem (Eye of Agamotto), przestrzenią (portale) i energią.', appearances:'Doctor Strange; Avengers; WandaVision — Marvel MCU' },
    { id:7,  name:'Magia Warhammer (Winds of Magic)', universe:'Warhammer Fantasy', tags:['chaos','wiatry','lory','ryzyko'],         desc:'Magia pochodzi z Warpstone i Wiatrów Magii — kolorowych sił płynących ze Skazy Chaosu na biegunie. Osiem Lore odpowiada ośmiu kolorom (Ogień, Życie, Niebo, Bestii, Cień, Metalu, Śmierci, Umysłu). Używanie magii jest zawsze niebezpieczne — istnieje ryzyko Miscast i wpadnięcia w szaleństwo.', appearances:'Warhammer Fantasy Roleplay; Total War: Warhammer' },
    { id:8,  name:'Magia Sowiego Maga',         universe:'Trylogia Sowiego Maga',   tags:['mana','rytuały','polska fantastyka'],      desc:'System magii z polskiej serii fantasy. Mana jest zasobem, który musi być zbierany i wydawany ostrożnie. Magia podzielona na szkoły rytualne wymagające czasu i skupienia oraz szybsze zaklęcia bojowe. Magowie płacą cenę za użycie mocy — zarówno fizyczną jak i mentalną.', appearances:'Trylogia Sowiego Maga — polska seria fantasy' },
    { id:9,  name:'Magia Krwi (Blood Magic)',    universe:'Dragon Age',              tags:['krew','zakazana','Tevinter','moc'],        desc:'Zakazana forma magii w świecie Dragon Age. Używa krwi — własnej lub innych — jako źródła mocy, omijając normalny limit magów. Pozwala na kontrolowanie umysłów, tworzenie potworów i kontakt z demonami. Używana oficjalnie w imperium Tevinter, zakazana przez Chantry w reszcie świata.', appearances:'Dragon Age: Origins; Dragon Age: Inquisition; Dragon Age: The Veilguard' },
  ],
};

// =========================================
// INIT
// =========================================
function initEncyclopedia(category) {
  CATEGORY = category;
  const stored = localStorage.getItem(`enc_${category}`);
  entries = stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(DEFAULTS[category] || []));
  buildUniverseFilter();
  render();
}

function buildUniverseFilter() {
  const sel = document.getElementById('universe-filter');
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = '<option value="">Wszystkie światy</option>';
  const universes = [...new Set(entries.map(e => e.universe))].sort();
  universes.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u; opt.textContent = u;
    sel.appendChild(opt);
  });
  sel.value = current;
}

// =========================================
// RENDER KART
// =========================================
function render() {
  const q   = document.getElementById('search')?.value.toLowerCase() || '';
  const uni = document.getElementById('universe-filter')?.value || '';

  const filtered = entries.filter(e => {
    const matchQ = !q || e.name.toLowerCase().includes(q) || e.desc.toLowerCase().includes(q) || (e.tags||[]).join(' ').toLowerCase().includes(q);
    const matchU = !uni || e.universe === uni;
    return matchQ && matchU;
  });

  const grid = document.getElementById('grid');
  if (!grid) return;

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--ink-faded);font-style:italic;padding:3rem">Brak wyników.</p>';
    return;
  }

  grid.innerHTML = filtered.map(e => `
    <div class="entry-card" onclick="openDetail(${e.id})">
      <h4>${e.name}</h4>
      <div class="entry-tags">
        <span class="tag gold">${e.universe}</span>${e.plec && e.plec !== "brak" ? `<span class="tag">${e.plec}</span>` : ""}
        ${(e.tags||[]).map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
      <p>${e.desc}</p>
      ${e.appearances ? `<div class="entry-origin">📍 ${e.appearances}</div>` : ''}
      <span class="read-hint">kliknij po więcej →</span>
    </div>
  `).join('');
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
      <div class="detail-modal" id="detail-modal">
        <h2 id="d-name"></h2>
        <div class="detail-universe" id="d-universe"></div><div id="d-orig" style="font-size:0.78rem;color:var(--ink-faded);font-style:italic;margin-bottom:0.5rem"></div>
        <div class="detail-tags" id="d-tags"></div>
        <div class="detail-divider"></div>
        <div class="detail-desc" id="d-desc"></div>
        <div class="detail-appearances" id="d-appearances"></div>
        <button class="detail-close" onclick="closeDetail()">✕ Zamknij</button>
        <button class="detail-delete" id="d-delete">🗑️ Usuń ten wpis</button>
      </div>`;
    overlay.addEventListener('click', ev => { if (ev.target === overlay) closeDetail(); });
    document.body.appendChild(overlay);
  }

  document.getElementById('d-name').textContent = e.name;
  document.getElementById('d-universe').textContent = '🌍 ' + e.universe;
  const origEl = document.getElementById('d-orig'); if(origEl) origEl.textContent = e.name_orig && e.name_orig !== e.name ? '✦ oryginalna nazwa: ' + e.name_orig : '';
  document.getElementById('d-tags').innerHTML = (e.tags||[]).map(t => `<span class="tag">${t}</span>`).join('');
  document.getElementById('d-desc').textContent = e.desc;
  document.getElementById('d-appearances').innerHTML = e.appearances
    ? `<strong>📍 Pojawia się w:</strong>${e.appearances}` : '';
  document.getElementById('d-delete').onclick = () => { deleteEntry(id); closeDetail(); };

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  const o = document.getElementById('detail-overlay');
  if (o) o.classList.remove('open');
  document.body.style.overflow = '';
}

function deleteEntry(id) {
  if (!confirm('Usunąć ten wpis?')) return;
  entries = entries.filter(e => e.id !== id);
  saveEntries();
  buildUniverseFilter();
  render();
}

// =========================================
// MODAL DODAWANIA
// =========================================
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
  buildUniverseFilter();
  render();
}

function saveEntries() {
  localStorage.setItem(`enc_${CATEGORY}`, JSON.stringify(entries));
}

// Zamknij modal klawiszem Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeDetail(); closeModal(); }
});
