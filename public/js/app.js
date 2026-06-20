// ===== News =====
async function loadNews() {
  const list = document.getElementById('news-list');
  try {
    const res = await fetch('/api/news');
    const items = await res.json();
    if (!items.length) {
      list.innerHTML = '<p>No updates yet — check back soon.</p>';
      return;
    }
    list.innerHTML = items
      .map(
        (item) => `
        <article class="news-card">
          <span class="news-date">${formatDate(item.date)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.body)}</p>
        </article>`
      )
      .join('');
  } catch (err) {
    list.innerHTML = '<p>Updates could not be loaded right now. Please try again later.</p>';
  }
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== Fun facts =====
async function loadFact() {
  const factText = document.getElementById('fact-text');
  factText.textContent = 'Fetching a fact…';
  try {
    const res = await fetch('/api/funfacts');
    const data = await res.json();
    factText.textContent = data.fact;
  } catch (err) {
    factText.textContent = "Couldn't load a fact right now. Try again in a moment.";
  }
}

document.getElementById('new-fact-btn').addEventListener('click', loadFact);

// ===== Reservation form =====
const form = document.getElementById('reservation-form');
const formMsg = document.getElementById('form-msg');

// Don't allow booking dates in the past
document.getElementById('date').min = new Date().toISOString().split('T')[0];

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formMsg.className = 'form-msg';
  formMsg.textContent = '';

  const payload = {
    name: document.getElementById('name').value.trim(),
    contact: document.getElementById('contact').value.trim(),
    cottage: document.getElementById('cottage').value,
    date: document.getElementById('date').value,
    guests: document.getElementById('guests').value,
  };

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Booking…';

  try {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      formMsg.className = 'form-msg error';
      formMsg.textContent = data.error || 'Something went wrong. Please try again.';
    } else {
      formMsg.className = 'form-msg success';
      formMsg.textContent = `You're booked! ${data.cottage} on ${formatDate(data.date)} for ${data.guests} guest(s).`;
      form.reset();
    }
  } catch (err) {
    formMsg.className = 'form-msg error';
    formMsg.textContent = 'Network error — please check your connection and try again.';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Book This Cottage';
  }
});

loadNews();
loadFact();
