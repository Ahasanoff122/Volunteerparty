document.addEventListener('DOMContentLoaded', () => {
  /* === MOBİL MENYU === */
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.querySelector('.nav');

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // klik headerə keçməsin
    const isOpen = nav.classList.toggle('open');
    menuBtn.textContent = isOpen ? '✖' : '☰';
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuBtn.textContent = '☰';
    });
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
      nav.classList.remove('open');
      menuBtn.textContent = '☰';
    }
  });

  /* === RSVP FORM AJAX GÖNDƏRİLMƏ === */
  const rsvpForm = document.getElementById('rsvpForm');
  const rsvpMsg = document.getElementById('rsvpMsg');

  rsvpForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const attendance = document.getElementById('attendance').value;
    const note = document.getElementById('note').value.trim();

    if (!name || !email) {
      rsvpMsg.textContent = 'Zəhmət olmasa ad və email daxil edin.';
      return;
    }

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, attendance, note })
      });

      const result = await res.json();
      console.log(result); // serverdən cavabı görmək üçün
      rsvpMsg.textContent = result.message || 'Qeydiyyat uğurla göndərildi!';
      if (result.success) rsvpForm.reset();
    } catch (err) {
      rsvpMsg.textContent = 'Xəta baş verdi, yenidən cəhd edin.';
      console.error(err);
    }

    setTimeout(() => (rsvpMsg.textContent = ''), 5000);
  });

  /* === ƏLAQƏ FORM === */
  const contactForm = document.getElementById('contactForm');
  const contactMsg = document.getElementById('contactMsg');

  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (!name || !email || !message) {
      contactMsg.textContent = 'Zəhmət olmasa bütün sahələri doldurun.';
      return;
    }

    try {
      // Əgər backend varsa, AJAX ilə göndərə bilərsən
      // await fetch('/api/contact', { method: 'POST', body: ... })

      contactMsg.textContent = 'Mesajınız qeydə alındı. Tezliklə cavab verəcəyik.';
      contactForm.reset();
    } catch (err) {
      contactMsg.textContent = 'Xəta baş verdi, yenidən cəhd edin.';
      console.error(err);
    }

    setTimeout(() => (contactMsg.textContent = ''), 5000);
  });
});
