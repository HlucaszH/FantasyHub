// library.js — zarządzanie biblioteką PDF

let books = [];

function loadBooks() {
  const stored = localStorage.getItem('library_books');
  books = stored ? JSON.parse(stored) : [];
}

function saveBooks() {
  // Zapisujemy tylko metadane, nie same PDFy (za duże dla localStorage)
  const meta = books.map(b => ({ id: b.id, name: b.name, tag: b.tag, size: b.size, date: b.date }));
  localStorage.setItem('library_books', JSON.stringify(meta));
}

function renderBooks() {
  const q = document.getElementById('search')?.value.toLowerCase() || '';
  const tag = document.getElementById('tag-filter')?.value || '';

  const filtered = books.filter(b => {
    const matchQ = !q || b.name.toLowerCase().includes(q);
    const matchT = !tag || b.tag === tag;
    return matchQ && matchT;
  });

  const grid = document.getElementById('books-grid');
  if (!grid) return;

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="empty-msg">Brak książek. Dodaj swój pierwszy PDF powyżej!</p>';
    return;
  }

  grid.innerHTML = filtered.map(b => `
    <div class="book-card">
      <div class="book-cover">📖</div>
      <h4>${b.name}</h4>
      <div class="book-meta">${b.size || ''} · ${b.date || ''}</div>
      ${b.tag ? `<span class="book-tag">${b.tag}</span>` : ''}
      <div class="book-actions">
        <button class="book-btn book-btn-read" onclick="openBook('${b.id}')">📖 Czytaj</button>
        <button class="book-btn book-btn-del" onclick="deleteBook('${b.id}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

function addBook(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const id = 'book_' + Date.now();
    const book = {
      id,
      name: file.name.replace('.pdf', ''),
      tag: '',
      size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
      date: new Date().toLocaleDateString('pl-PL'),
      dataUrl: e.target.result
    };

    // Zapisz PDF w sessionStorage (nie persystuje, ale działa w ramach sesji)
    try {
      sessionStorage.setItem(id, book.dataUrl);
    } catch {
      alert('⚠️ Plik jest za duży dla przeglądarki. Spróbuj mniejszy PDF.');
      return;
    }

    books.push(book);
    saveBooks();
    renderBooks();
  };
  reader.readAsDataURL(file);
}

function openBook(id) {
  const dataUrl = sessionStorage.getItem(id);
  if (!dataUrl) {
    alert('❌ Plik niedostępny. Dodaj go ponownie (PDFy nie są zapisywane trwale — to ograniczenie przeglądarki).');
    return;
  }
  const book = books.find(b => b.id === id);
  document.getElementById('reader-title').textContent = book?.name || 'Książka';
  document.getElementById('reader-frame').src = dataUrl;
  document.getElementById('reader-overlay').classList.add('open');
}

function closeReader() {
  document.getElementById('reader-overlay').classList.remove('open');
  document.getElementById('reader-frame').src = '';
}

function deleteBook(id) {
  if (!confirm('Usunąć tę książkę z listy?')) return;
  books = books.filter(b => b.id !== id);
  sessionStorage.removeItem(id);
  saveBooks();
  renderBooks();
}

// Drag & drop
const uploadZone = document.getElementById('upload-zone');
if (uploadZone) {
  uploadZone.addEventListener('dragover', e => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
  });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
  uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    [...e.dataTransfer.files].forEach(f => { if (f.type === 'application/pdf') addBook(f); });
  });
}

// Input file
const fileInput = document.getElementById('file-input');
if (fileInput) {
  fileInput.addEventListener('change', e => {
    [...e.target.files].forEach(f => addBook(f));
    fileInput.value = '';
  });
}

// Init
loadBooks();
renderBooks();
