// public/app.js
const API = '/api/items';


const els = {
  cards: document.getElementById('cardsContainer'),
  noResults: document.getElementById('noResults'),
  search: document.getElementById('searchInput'),
  filter: document.getElementById('filterSelect'),
  addBtn: document.getElementById('addBtn'),
  title: document.getElementById('titleInput'),
  type: document.getElementById('typeSelect'),
  description: document.getElementById('descriptionInput'),
  details: document.getElementById('detailsInput')
};

let allItems = [];

// ---- API helpers ----
async function fetchItems() {
  const res = await fetch(API);
  return res.json();
}

async function createItem(payload) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const msg = await res.json().catch(() => ({}));
    throw new Error(msg.message || 'Failed to add item');
  }
  return res.json();
}

async function deleteItem(id) {
  await fetch(`${API}/${id}`, { method: 'DELETE' });
}

// ---- Render ----
function render(items) {
  els.cards.innerHTML = '';
  if (!items.length) {
    els.noResults.classList.remove('hidden');
    return;
  }
  els.noResults.classList.add('hidden');

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'rounded-2xl shadow-md hover:shadow-xl transition bg-white';
    card.innerHTML = `
      <div class="p-4">
        <h2 class="text-xl font-semibold mb-2">${escapeHtml(item.title)}</h2>
        <p class="text-sm text-gray-600 mb-2">${escapeHtml(item.type)}</p>
        <p class="text-gray-800 mb-2">${escapeHtml(item.description)}</p>

        <details class="mt-2">
          <summary class="cursor-pointer text-sm text-blue-700">More Info</summary>
          <p class="text-gray-700 text-sm mt-2">${escapeHtml(item.details || '—')}</p>
        </details>

        <div class="flex gap-2 mt-3">
          <button data-id="${item._id}" class="bg-red-600 text-white px-3 py-1 rounded-md text-sm delete-btn">
            Delete
          </button>
        </div>
      </div>
    `;
    els.cards.appendChild(card);
  });

  // wire delete buttons
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      await deleteItem(id);
      allItems = allItems.filter(i => i._id !== id);
      applyFilters();
    });
  });
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

// ---- Filters ----
function applyFilters() {
  const q = els.search.value.trim().toLowerCase();
  const type = els.filter.value;

  const filtered = allItems.filter(item => {
    const matchesType = (type === 'All') || item.type === type;
    const matchesText =
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.details || '').toLowerCase().includes(q);
    return matchesType && matchesText;
  });

  render(filtered);
}

// ---- Events ----
els.search.addEventListener('input', applyFilters);
els.filter.addEventListener('change', applyFilters);

els.addBtn.addEventListener('click', async () => {
  const payload = {
    title: els.title.value.trim(),
    type: els.type.value,
    description: els.description.value.trim(),
    details: els.details.value.trim()
  };
  if (!payload.title || !payload.description) {
    alert('Please provide Title and Description.');
    return;
  }
  try {
    const saved = await createItem(payload);
    allItems.unshift(saved);
    // reset form
    els.title.value = '';
    els.type.value = 'Project';
    els.description.value = '';
    els.details.value = '';
    applyFilters();
  } catch (err) {
    alert(err.message);
  }
});

// ---- Init ----
(async function init() {
  try {
    allItems = await fetchItems();
  } catch (e) {
    console.error(e);
    allItems = [];
  }
  applyFilters();
})();
