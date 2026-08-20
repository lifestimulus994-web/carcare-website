/* ================== CONSTANTS ================== */
const CATEGORY_LABELS = { sedan: 'სედანი', suv: 'ჯიპი / SUV', sport: 'სპორტული', premium: 'პრემიუმი' };

const ICON_EDIT = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
const ICON_DELETE = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13"/></svg>';

/* ================== DOM ================== */
const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const currentUserEmail = document.getElementById('currentUserEmail');
const carsTableBody = document.getElementById('carsTableBody');
const carModal = document.getElementById('carModal');
const carFormError = document.getElementById('carFormError');
const blockList = document.getElementById('blockList');
const blockHint = document.getElementById('blockHint');

let currentCars = [];
let editingCarId = null;
let editingBlocks = [];

/* ================== MODAL HELPERS ================== */
function openModal(bd) { bd.classList.add('open'); bd.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
function closeModal(bd) { bd.classList.remove('open'); bd.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
document.querySelectorAll('.modal-backdrop').forEach(bd => {
  bd.addEventListener('click', (e) => { if (e.target === bd) closeModal(bd); });
  bd.querySelectorAll('.modal-close').forEach(btn => btn.addEventListener('click', () => closeModal(bd)));
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-backdrop.open').forEach(bd => closeModal(bd));
});

/* ================== AUTH ================== */
function showDashboard(user) {
  loginView.hidden = true;
  dashboardView.hidden = false;
  currentUserEmail.textContent = user.email;
  loadCarsAdmin();
}
function showLogin() {
  loginView.hidden = false;
  dashboardView.hidden = true;
}

sb.auth.getSession().then(({ data }) => {
  if (data.session) showDashboard(data.session.user); else showLogin();
});
sb.auth.onAuthStateChange((_event, session) => {
  if (session) showDashboard(session.user); else showLogin();
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.hidden = true;
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    loginError.textContent = 'შესვლა ვერ მოხერხდა — გადაამოწმე email/პაროლი.';
    loginError.hidden = false;
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => sb.auth.signOut());

/* ================== CARS LIST ================== */
async function loadCarsAdmin() {
  const { data, error } = await sb.from('cars').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return; }
  currentCars = data;
  renderCarsTable();
}

function renderCarsTable() {
  carsTableBody.innerHTML = currentCars.map(c => `
    <tr>
      <td><img class="admin-car-thumb" src="${c.image_url || ''}" alt=""></td>
      <td>${c.name}${c.featured ? '<span class="badge badge-featured">TOP</span>' : ''}</td>
      <td>${CATEGORY_LABELS[c.category] || c.category}</td>
      <td>${c.price_1day}₾ / ${c.price_multiday}₾</td>
      <td><span class="badge ${c.active ? 'badge-active' : 'badge-inactive'}">${c.active ? 'აქტიური' : 'გამორთული'}</span></td>
      <td class="row-actions">
        <button type="button" class="icon-btn" data-edit="${c.id}" title="რედაქტირება">${ICON_EDIT}</button>
        <button type="button" class="icon-btn danger" data-del="${c.id}" title="წაშლა">${ICON_DELETE}</button>
      </td>
    </tr>`).join('') || `<tr><td colspan="6" class="empty-hint">მანქანები არაა დამატებული.</td></tr>`;
}

carsTableBody.addEventListener('click', (e) => {
  const editBtn = e.target.closest('[data-edit]');
  const delBtn = e.target.closest('[data-del]');
  if (editBtn) openCarModal(currentCars.find(c => c.id === editBtn.dataset.edit));
  if (delBtn) deleteCar(delBtn.dataset.del, delBtn.closest('tr').children[1].textContent);
});

async function deleteCar(id, name) {
  if (!confirm(`წავშალო "${name}"? ეს წაშლის მასთან დაკავშირებულ ყველა დაჯავშნის ჩანაწერსაც.`)) return;
  const { error } = await sb.from('cars').delete().eq('id', id);
  if (error) { alert('წაშლა ვერ მოხერხდა: ' + error.message); return; }
  loadCarsAdmin();
}

document.getElementById('newCarBtn').addEventListener('click', () => openCarModal(null));

/* ================== CAR FORM ================== */
const F = {
  name: document.getElementById('fName'),
  year: document.getElementById('fYear'),
  category: document.getElementById('fCategory'),
  engine: document.getElementById('fEngine'),
  gearbox: document.getElementById('fGearbox'),
  fuel: document.getElementById('fFuel'),
  seats: document.getElementById('fSeats'),
  price1: document.getElementById('fPrice1'),
  priceMulti: document.getElementById('fPriceMulti'),
  image: document.getElementById('fImage'),
  featured: document.getElementById('fFeatured'),
  active: document.getElementById('fActive'),
  ownerName: document.getElementById('fOwnerName'),
  ownerPhone: document.getElementById('fOwnerPhone'),
  ownerNote: document.getElementById('fOwnerNote'),
  blockStart: document.getElementById('fBlockStart'),
  blockEnd: document.getElementById('fBlockEnd')
};

function resetForm() {
  F.name.value = ''; F.year.value = new Date().getFullYear(); F.category.value = 'sedan';
  F.engine.value = ''; F.gearbox.value = 'ავტომატი'; F.fuel.value = ''; F.seats.value = 5;
  F.price1.value = ''; F.priceMulti.value = ''; F.image.value = '';
  F.featured.checked = false; F.active.checked = true;
  F.ownerName.value = ''; F.ownerPhone.value = ''; F.ownerNote.value = '';
  carFormError.hidden = true;
}

async function openCarModal(car) {
  resetForm();
  editingCarId = car ? car.id : null;
  document.getElementById('carModalTitle').textContent = car ? 'მანქანის რედაქტირება' : 'ახალი მანქანა';

  if (car) {
    F.name.value = car.name; F.year.value = car.year; F.category.value = car.category;
    F.engine.value = car.engine; F.gearbox.value = car.gearbox; F.fuel.value = car.fuel;
    F.seats.value = car.seats; F.price1.value = car.price_1day; F.priceMulti.value = car.price_multiday;
    F.image.value = car.image_url || ''; F.featured.checked = car.featured; F.active.checked = car.active;

    const { data: note } = await sb.from('car_owner_notes').select('*').eq('car_id', car.id).maybeSingle();
    if (note) { F.ownerName.value = note.owner_name || ''; F.ownerPhone.value = note.owner_phone || ''; F.ownerNote.value = note.note || ''; }

    const { data: blocks } = await sb.from('booking_blocks').select('*').eq('car_id', car.id).order('start_date');
    editingBlocks = blocks || [];
    blockHint.hidden = true;
  } else {
    editingBlocks = [];
    blockHint.hidden = false;
  }
  renderBlockList();
  openModal(carModal);
}

document.getElementById('saveCarBtn').addEventListener('click', async () => {
  carFormError.hidden = true;
  if (!F.name.value.trim() || !F.engine.value.trim() || !F.gearbox.value.trim() || !F.fuel.value.trim() || !F.price1.value || !F.priceMulti.value) {
    carFormError.textContent = 'შეავსე ყველა სავალდებულო ველი.';
    carFormError.hidden = false;
    return;
  }
  const payload = {
    name: F.name.value.trim(), year: Number(F.year.value), category: F.category.value,
    engine: F.engine.value.trim(), gearbox: F.gearbox.value.trim(), fuel: F.fuel.value.trim(),
    seats: Number(F.seats.value), price_1day: Number(F.price1.value), price_multiday: Number(F.priceMulti.value),
    image_url: F.image.value.trim() || null, featured: F.featured.checked, active: F.active.checked
  };

  let carId = editingCarId;
  if (carId) {
    const { error } = await sb.from('cars').update(payload).eq('id', carId);
    if (error) { carFormError.textContent = 'შენახვა ვერ მოხერხდა: ' + error.message; carFormError.hidden = false; return; }
  } else {
    const { data, error } = await sb.from('cars').insert(payload).select().single();
    if (error) { carFormError.textContent = 'შენახვა ვერ მოხერხდა: ' + error.message; carFormError.hidden = false; return; }
    carId = data.id;
  }

  if (F.ownerName.value.trim() || F.ownerPhone.value.trim() || F.ownerNote.value.trim()) {
    await sb.from('car_owner_notes').upsert({
      car_id: carId, owner_name: F.ownerName.value.trim(), owner_phone: F.ownerPhone.value.trim(),
      note: F.ownerNote.value.trim(), updated_at: new Date().toISOString()
    }, { onConflict: 'car_id' });
  }

  closeModal(carModal);
  loadCarsAdmin();
});

/* ================== BOOKING BLOCKS ================== */
function renderBlockList() {
  blockList.innerHTML = editingBlocks.length
    ? editingBlocks.map(b => `<div class="block-row"><span>${b.start_date} → ${b.end_date}</span><button type="button" class="icon-btn danger" data-delblock="${b.id}">${ICON_DELETE}</button></div>`).join('')
    : `<p class="empty-hint">დაკავებული დღეები არაა დამატებული.</p>`;
}

blockList.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-delblock]');
  if (!btn) return;
  const { error } = await sb.from('booking_blocks').delete().eq('id', btn.dataset.delblock);
  if (error) { alert('წაშლა ვერ მოხერხდა: ' + error.message); return; }
  editingBlocks = editingBlocks.filter(b => b.id !== btn.dataset.delblock);
  renderBlockList();
});

document.getElementById('addBlockBtn').addEventListener('click', async () => {
  if (!editingCarId) { alert('ჯერ შეინახე მანქანა, მერე დაამატე დაკავებული დღეები.'); return; }
  const start = F.blockStart.value, end = F.blockEnd.value;
  if (!start || !end || end < start) { alert('აირჩიე სწორი პერიოდი (დან ≤ მდე).'); return; }
  const { data, error } = await sb.from('booking_blocks').insert({ car_id: editingCarId, start_date: start, end_date: end }).select().single();
  if (error) { alert('დამატება ვერ მოხერხდა: ' + error.message); return; }
  editingBlocks.push(data);
  editingBlocks.sort((a, b) => a.start_date.localeCompare(b.start_date));
  renderBlockList();
  F.blockStart.value = ''; F.blockEnd.value = '';
});
