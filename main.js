/* ============================================================
   CLUSTER DJ — main.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. NAV: sombra al hacer scroll ── */
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });

  /* ── 1b. HAMBURGER MENU ── */
  const hamburger = document.querySelector('.nav-hamburger');
  const navMenu = document.querySelector('nav ul');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      const open = navMenu.classList.toggle('open');
      hamburger.classList.toggle('active', open);
      hamburger.setAttribute('aria-expanded', open);
    });
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── 2. ANIMACIONES de entrada con IntersectionObserver ── */
  const animEls = document.querySelectorAll('.animate');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  animEls.forEach(el => observer.observe(el));

  /* ── 3. SMOOTH SCROLL para los links del nav ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── 4. Año dinámico en el footer ── */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── 5. MODAL BOLSA DE TALENTO: cerrar al click en overlay ── */
  const overlay = document.getElementById('talentModal');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeTalentModal();
    });
  }

});

function openTalentModal() {
  document.getElementById('talentModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeTalentModal() {
  document.getElementById('talentModal').classList.remove('open');
  document.body.style.overflow = '';
}
