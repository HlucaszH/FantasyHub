// Fantasy Hub — main.js
// Nic krytycznego tutaj, tylko drobne efekty

document.addEventListener('DOMContentLoaded', () => {
  // Twinkling stars (opcjonalne - możesz usunąć)
  const stars = document.querySelector('.stars');
  if (stars) {
    setInterval(() => {
      stars.style.opacity = 0.85 + Math.random() * 0.15;
    }, 3000);
  }
});
