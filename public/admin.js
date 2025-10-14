document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.querySelector('#rsvpTable tbody');
  const filterName = document.getElementById('filterName');
  const filterAttendance = document.getElementById('filterAttendance');

  let rsvpList = [];

  // 🔹 Məlumatı gətir
  async function fetchRSVP() {
    try {
      const res = await fetch('/api/rsvp');
      rsvpList = await res.json();
      applyFilters(); // başlanğıcda göstər
    } catch (err) {
      console.error(err);
      tableBody.innerHTML = `<tr><td colspan="7">Məlumatları gətirmək mümkün olmadı.</td></tr>`;
    }
  }

  // 🔹 Cədvəli göstər
  function renderTable(list) {
    tableBody.innerHTML = '';

    if (list.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7">Heç bir qeyd yoxdur.</td></tr>`;
      return;
    }

    list.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.name || '-'}</td>
        <td>${item.email || '-'}</td>
        <td>${item.phone || '-'}</td>
        <td>${formatAttendance(item.attendance)}</td>
        <td>${item.note || '-'}</td>
        <td>${new Date(item.createdAt).toLocaleString()}</td>
        <td><button class="deleteBtn" data-id="${item._id}">Sil</button></td>
      `;
      tableBody.appendChild(tr);
    });

    // 🔹 Sil düymələri üçün hadisə
    document.querySelectorAll('.deleteBtn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('Bu müraciəti silmək istədiyinizə əminsiniz?')) {
          await deleteRSVP(id);
        }
      });
    });
  }

  // 🔹 Attendance sahəsini tərcümə et
  function formatAttendance(value) {
    if (!value) return '-';
    const val = value.toLowerCase();
    if (val === 'yes') return 'Gələcək';
    if (val === 'maybe') return 'Bəlkə gələcək';
    if (val === 'no') return 'Gəlməyəcək';
    return '-';
  }

  // 🔹 Müraciəti sil
  async function deleteRSVP(id) {
    try {
      const res = await fetch(`/api/rsvp/${id}`, { method: 'DELETE' });
      if (res.ok) {
        rsvpList = rsvpList.filter(r => r._id !== id);
        applyFilters(); // yenidən tətbiq et
      } else {
        alert('Silinmə zamanı xəta baş verdi.');
      }
    } catch (err) {
      console.error(err);
      alert('Serverlə əlaqə qurulmadı.');
    }
  }

  // 🔹 Real-time filtrləmə
  function applyFilters() {
    let filtered = [...rsvpList];
    const nameVal = (filterName.value || '').trim().toLowerCase();
    const attendanceVal = (filterAttendance.value || '').toLowerCase();

    // Ad filtiri
    if (nameVal) {
      filtered = filtered.filter(r => (r.name || '').toLowerCase().includes(nameVal));
    }

    // Attendance filtiri
    if (attendanceVal) {
      filtered = filtered.filter(r => {
        const att = (r.attendance || '').toLowerCase();
        if (attendanceVal === 'yes') return att === 'yes' || att === 'maybe';
        if (attendanceVal === 'no') return att === 'no';
        return true;
      });
    }

    renderTable(filtered);
  }

  // 🔹 Input və select dəyişikliklərini izləyirik
  filterName.addEventListener('input', applyFilters);
  filterAttendance.addEventListener('change', applyFilters);

  fetchRSVP();
});
