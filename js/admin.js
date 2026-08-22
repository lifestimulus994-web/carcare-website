/* ================== CONSTANTS ================== */
let CATEGORIES = [];
function categoryLabelKa(slug) {
  const c = CATEGORIES.find(c => c.slug === slug);
  return c ? c.label_ka : slug;
}

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
async function showDashboard(user) {
  loginView.hidden = true;
  dashboardView.hidden = false;
  currentUserEmail.textContent = user.email;
  await loadCategoriesAdmin();
  loadCarsAdmin();
  loadTextsAdmin();
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

const loginBtn = document.getElementById('loginBtn');
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.hidden = true;
  loginBtn.disabled = true;
  loginBtn.textContent = 'შედის...';
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  try {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Supabase login error:', error);
      loginError.textContent = 'შესვლა ვერ მოხერხდა: ' + error.message;
      loginError.hidden = false;
    }
  } catch (err) {
    console.error('Login threw:', err);
    loginError.textContent = 'დაფიქსირდა ტექნიკური შეცდომა — გახსენი Console (F12) და გადაამოწმე დეტალები.';
    loginError.hidden = false;
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'შესვლა';
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
      <td>${categoryLabelKa(c.category)}</td>
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
  F.category.innerHTML = CATEGORIES.map(c => `<option value="${c.slug}">${c.label_ka}</option>`).join('');
  F.name.value = ''; F.year.value = new Date().getFullYear();
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

/* ================== TABS ================== */
const TAB_VIEWS = { cars: document.getElementById('tabCars'), categories: document.getElementById('tabCategories'), texts: document.getElementById('tabTexts') };
document.getElementById('adminTabs').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-tab]');
  if (!btn) return;
  document.querySelectorAll('#adminTabs .chip').forEach(c => c.classList.toggle('active', c === btn));
  Object.entries(TAB_VIEWS).forEach(([name, el]) => { el.hidden = name !== btn.dataset.tab; });
});

/* ================== CATEGORIES ================== */
const categoriesTableBody = document.getElementById('categoriesTableBody');
const categoryModal = document.getElementById('categoryModal');
const categoryFormError = document.getElementById('categoryFormError');
let editingCategoryId = null;

const G = {
  slug: document.getElementById('gSlug'),
  labelKa: document.getElementById('gLabelKa'),
  labelEn: document.getElementById('gLabelEn'),
  sortOrder: document.getElementById('gSortOrder'),
  active: document.getElementById('gActive')
};

async function loadCategoriesAdmin() {
  const { data, error } = await sb.from('categories').select('*').order('sort_order');
  if (error) { console.error(error); return; }
  CATEGORIES = data;
  renderCategoriesTable();
}

function renderCategoriesTable() {
  categoriesTableBody.innerHTML = CATEGORIES.map(c => `
    <tr>
      <td><code>${c.slug}</code></td>
      <td>${c.label_ka}</td>
      <td>${c.label_en}</td>
      <td>${c.sort_order}</td>
      <td><span class="badge ${c.active ? 'badge-active' : 'badge-inactive'}">${c.active ? 'აქტიური' : 'გამორთული'}</span></td>
      <td class="row-actions">
        <button type="button" class="icon-btn" data-editcat="${c.id}" title="რედაქტირება">${ICON_EDIT}</button>
        <button type="button" class="icon-btn danger" data-delcat="${c.id}" title="წაშლა">${ICON_DELETE}</button>
      </td>
    </tr>`).join('') || `<tr><td colspan="6" class="empty-hint">კატეგორია არაა დამატებული.</td></tr>`;
}

categoriesTableBody.addEventListener('click', (e) => {
  const editBtn = e.target.closest('[data-editcat]');
  const delBtn = e.target.closest('[data-delcat]');
  if (editBtn) openCategoryModal(CATEGORIES.find(c => c.id === editBtn.dataset.editcat));
  if (delBtn) deleteCategory(delBtn.dataset.delcat, delBtn.closest('tr').children[1].textContent);
});

async function deleteCategory(id, label) {
  const inUse = currentCars.some(c => c.category === CATEGORIES.find(cat => cat.id === id)?.slug);
  if (inUse) { alert(`"${label}" კატეგორიას იყენებს ერთი ან მეტი მანქანა — ჯერ შეუცვალე მათ კატეგორია, მერე წაშალე.`); return; }
  if (!confirm(`წავშალო კატეგორია "${label}"?`)) return;
  const { error } = await sb.from('categories').delete().eq('id', id);
  if (error) { alert('წაშლა ვერ მოხერხდა: ' + error.message); return; }
  loadCategoriesAdmin();
}

document.getElementById('newCategoryBtn').addEventListener('click', () => openCategoryModal(null));

function openCategoryModal(cat) {
  editingCategoryId = cat ? cat.id : null;
  categoryFormError.hidden = true;
  document.getElementById('categoryModalTitle').textContent = cat ? 'კატეგორიის რედაქტირება' : 'ახალი კატეგორია';
  G.slug.value = cat ? cat.slug : '';
  G.slug.disabled = !!cat;
  G.labelKa.value = cat ? cat.label_ka : '';
  G.labelEn.value = cat ? cat.label_en : '';
  G.sortOrder.value = cat ? cat.sort_order : (CATEGORIES.length + 1) * 10;
  G.active.checked = cat ? cat.active : true;
  openModal(categoryModal);
}

document.getElementById('saveCategoryBtn').addEventListener('click', async () => {
  categoryFormError.hidden = true;
  const slug = G.slug.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
  if (!slug || !G.labelKa.value.trim() || !G.labelEn.value.trim()) {
    categoryFormError.textContent = 'შეავსე slug და ორივე ენის სახელი.';
    categoryFormError.hidden = false;
    return;
  }
  const payload = {
    slug, label_ka: G.labelKa.value.trim(), label_en: G.labelEn.value.trim(),
    sort_order: Number(G.sortOrder.value) || 0, active: G.active.checked
  };
  const q = editingCategoryId
    ? sb.from('categories').update(payload).eq('id', editingCategoryId)
    : sb.from('categories').insert(payload);
  const { error } = await q;
  if (error) {
    categoryFormError.textContent = 'შენახვა ვერ მოხერხდა: ' + (error.code === '23505' ? 'ეს slug უკვე დაკავებულია.' : error.message);
    categoryFormError.hidden = false;
    return;
  }
  closeModal(categoryModal);
  loadCategoriesAdmin();
});

/* ================== SITE TEXTS ================== */
const textsList = document.getElementById('textsList');
const textSearch = document.getElementById('textSearch');
const textSectionFilter = document.getElementById('textSectionFilter');
let allTexts = [];
const SECTION_LABELS = {
  nav: 'მენიუ', hero: 'მთავარი (Hero)', search: 'საძებნი ველი', fleet: 'ავტოპარკი',
  categories: 'კატეგორიების სექცია', why: 'რატომ ჩვენ', reviews: 'შეფასებები', cta: 'CTA ბანერი',
  footer: 'ფუტერი', faq: 'კითხვები (FAQ)', booking: 'ჯავშნის ფანჯარა', terms: 'წესები და პირობები',
  location: 'ლოკაცია', other: 'სხვა'
};

async function loadTextsAdmin() {
  const { data, error } = await sb.from('site_texts').select('*').order('section').order('key');
  if (error) { console.error(error); return; }
  allTexts = data;
  const sections = [...new Set(allTexts.map(t => t.section))];
  textSectionFilter.innerHTML = '<option value="all">ყველა სექცია</option>' +
    sections.map(s => `<option value="${s}">${SECTION_LABELS[s] || s}</option>`).join('');
  renderTexts();
}

function renderTexts() {
  const q = textSearch.value.trim().toLowerCase();
  const sectionFilter = textSectionFilter.value;
  const filtered = allTexts.filter(t => {
    if (sectionFilter !== 'all' && t.section !== sectionFilter) return false;
    if (!q) return true;
    return t.key.toLowerCase().includes(q) || t.value_ka.toLowerCase().includes(q) || t.value_en.toLowerCase().includes(q);
  });

  let html = '';
  let lastSection = null;
  filtered.forEach(row => {
    if (row.section !== lastSection) {
      html += `<div class="text-section-head">${SECTION_LABELS[row.section] || row.section}</div>`;
      lastSection = row.section;
    }
    html += `
      <div class="text-row" data-key="${row.key}">
        <div class="text-row-key">${row.key}</div>
        <div class="text-row-fields">
          <textarea data-field="ka">${row.value_ka}</textarea>
          <textarea data-field="en">${row.value_en}</textarea>
          <button type="button" class="btn btn-outline text-row-save" data-save="${row.key}">შენახვა</button>
        </div>
      </div>`;
  });
  textsList.innerHTML = html || `<p class="empty-hint">არაფერი მოიძებნა.</p>`;
}

textSearch.addEventListener('input', renderTexts);
textSectionFilter.addEventListener('change', renderTexts);

textsList.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-save]');
  if (!btn) return;
  const row = btn.closest('.text-row');
  const key = row.dataset.key;
  const valueKa = row.querySelector('[data-field="ka"]').value;
  const valueEn = row.querySelector('[data-field="en"]').value;
  btn.textContent = 'ინახება...';
  btn.disabled = true;
  const { error } = await sb.from('site_texts').update({ value_ka: valueKa, value_en: valueEn, updated_at: new Date().toISOString() }).eq('key', key);
  btn.disabled = false;
  if (error) {
    btn.textContent = 'შეცდომა';
    alert('შენახვა ვერ მოხერხდა: ' + error.message);
  } else {
    btn.textContent = 'შენახულია ✓';
    row.classList.add('saved');
    const t = allTexts.find(t => t.key === key);
    if (t) { t.value_ka = valueKa; t.value_en = valueEn; }
    setTimeout(() => { btn.textContent = 'შენახვა'; row.classList.remove('saved'); }, 1800);
  }
});
