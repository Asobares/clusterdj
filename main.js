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

  /* ── 6. FORMULARIO DE INSCRIPCIÓN (Supabase) ── */
  const inscForm = document.getElementById('inscForm');
  if (inscForm) initInscripcion(inscForm);

});

const SUPABASE_URL = 'https://pbqmkodwmntujezbokgo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBicW1rb2R3bW50dWplemJva2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTQzOTIsImV4cCI6MjA4NjQzMDM5Mn0.C9sw9cix0J9Z2eTh-lr_4S6_gZmHIVwpzsxrZMCKl34';

function initInscripcion(form) {
  const errorEl = document.getElementById('inscError');
  const submitBtn = form.querySelector('.insc-submit');
  const telInput = form.elements.telefono;

  // Solo dígitos en el celular
  telInput.addEventListener('input', () => {
    telInput.value = telInput.value.replace(/\D/g, '').slice(0, 10);
  });

  const showError = (msg) => {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    form.classList.add('submitted');
    if (!form.reportValidity()) return;

    if (!window.supabase) {
      showError('No pudimos conectar con el servidor. Revisa tu conexión y recarga la página.');
      return;
    }
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Campos de texto limpios; vacíos → null
    const data = {};
    for (const el of form.elements) {
      if (!el.name) continue;
      const v = el.value.trim();
      data[el.name] = v === '' ? null : v;
    }
    data.email = data.email.toLowerCase();
    if (data.empresa_email) data.empresa_email = data.empresa_email.toLowerCase();

    submitBtn.disabled = true;
    submitBtn.textContent = 'ENVIANDO…';

    const { error } = await client.from('inscripciones_cluster_dj').insert(data);

    if (error) {
      console.error('Supabase insert error:', error);
      showError(error.code === '23505'
        ? 'Ya existe una inscripción con estos datos. Si crees que es un error, escríbenos.'
        : 'Ocurrió un error al enviar tu inscripción. Inténtalo de nuevo en unos minutos.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'INSCRÍBETE AHORA';
      return;
    }

    // El registro ya quedó guardado: un fallo del correo no bloquea la pantalla de éxito
    client.functions.invoke('send-confirmation', {
      body: {
        email: data.email,
        nombre: data.nombre,
        evento: 'Cluster DJ — Comunidad de DJs de Colombia',
        fecha: '',
        hora: '',
        lugar: 'Quedaste registrado en la comunidad de DJs más grande de Colombia. Pronto te contactaremos con novedades, eventos y oportunidades.',
        direccion: '',
        link: 'https://www.clusterdj.co',
        link_label: 'Visitar Cluster DJ →'
      }
    }).then(({ error: fnError }) => {
      if (fnError) console.error('send-confirmation error:', fnError);
    }).catch(err => console.error('send-confirmation error:', err));

    if (typeof gtag === 'function') gtag('event', 'sign_up', { method: 'formulario_cluster' });

    document.getElementById('inscSuccessName').textContent = data.nombre.toUpperCase();
    document.getElementById('inscSuccessEmail').textContent = data.email;
    form.hidden = true;
    const success = document.getElementById('inscSuccess');
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    success.focus({ preventScroll: true });
  });
}

function openTalentModal() {
  document.getElementById('talentModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeTalentModal() {
  document.getElementById('talentModal').classList.remove('open');
  document.body.style.overflow = '';
}
