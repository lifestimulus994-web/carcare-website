/* ================== DATA ================== */
const CARS = [
  {
    id: 'bmw3', name: 'BMW 3 Series', year: 2022, cat: 'sedan', price: 140,
    img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=70',
    gear: { ka: 'ავტომატი', en: 'Automatic' }, fuel: { ka: 'ბენზინი', en: 'Petrol' }, seats: 5
  },
  {
    id: 'tesla3', name: 'Tesla Model 3', year: 2023, cat: 'sedan', price: 170, tag: true,
    img: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=70',
    gear: { ka: 'ავტომატი', en: 'Automatic' }, fuel: { ka: 'ელექტრო', en: 'Electric' }, seats: 5
  },
  {
    id: 'crv', name: 'Honda CR-V', year: 2022, cat: 'suv', price: 150,
    img: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=70',
    gear: { ka: 'ავტომატი', en: 'Automatic' }, fuel: { ka: 'ჰიბრიდი', en: 'Hybrid' }, seats: 5
  },
  {
    id: 'expedition', name: 'Ford Expedition', year: 2022, cat: 'suv', price: 220,
    img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=70',
    gear: { ka: 'ავტომატი', en: 'Automatic' }, fuel: { ka: 'ბენზინი', en: 'Petrol' }, seats: 7
  },
  {
    id: 'porsche', name: 'Porsche 911 Turbo', year: 2022, cat: 'sport', price: 450, tag: true,
    img: 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=800&q=70',
    gear: { ka: 'ავტომატი', en: 'Automatic' }, fuel: { ka: 'ბენზინი', en: 'Petrol' }, seats: 2
  },
  {
    id: 'mustang', name: 'Ford Mustang GT', year: 2021, cat: 'sport', price: 280,
    img: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=70',
    gear: { ka: 'ავტომატი', en: 'Automatic' }, fuel: { ka: 'ბენზინი', en: 'Petrol' }, seats: 4
  },
  {
    id: 'merc-cla', name: 'Mercedes-Benz CLA', year: 2022, cat: 'premium', price: 190,
    img: 'https://images.unsplash.com/photo-1570733577524-3a047079e80d?auto=format&fit=crop&w=800&q=70',
    gear: { ka: 'ავტომატი', en: 'Automatic' }, fuel: { ka: 'ბენზინი', en: 'Petrol' }, seats: 5
  },
  {
    id: 'amg-gt', name: 'Mercedes-AMG GT', year: 2021, cat: 'premium', price: 400,
    img: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=70',
    gear: { ka: 'ავტომატი', en: 'Automatic' }, fuel: { ka: 'ბენზინი', en: 'Petrol' }, seats: 2
  }
];

/* ================== I18N ================== */
const I18N = {
  ka: {
    nav_home: 'მთავარი', nav_fleet: 'ავტოპარკი', nav_categories: 'კატეგორიები',
    nav_why: 'უპირატესობები', nav_contact: 'კონტაქტი', nav_cta: 'დაჯავშნა',
    hero_l1: 'იპოვე იდეალური მანქანა', hero_l2: 'იმგზავრე თავისუფლად',
    hero_sub: 'გაქირავება მარტივად — ახალი ავტოპარკი, სრული დაზღვევა და გამჭვირვალე ფასები. აიღე დღესვე, იმგზავრე თავისუფლად.',
    hero_btn1: 'ავტოპარკის ნახვა', hero_btn2: 'დაგვიკავშირდი',
    stat_cars: 'ავტომობილი', stat_support: 'მხარდაჭერა', stat_ins: 'დაზღვევა', stat_ins_v: 'სრული',
    badge_rating: 'მომხმარებლის შეფასება',
    s_loc: 'აღების ადგილი', s_from: 'აღების თარიღი', s_to: 'დაბრუნების თარიღი',
    s_cat: 'კატეგორია', s_btn: 'მოძებნა',
    s_loc_tbilisi: 'თბილისი', s_loc_airport: 'თბილისის აეროპორტი', s_loc_batumi: 'ბათუმი', s_loc_kutaisi: 'ქუთაისი',
    cat_all: 'ყველა', cat_sedan: 'სედანი', cat_suv: 'ჯიპი / SUV', cat_sport: 'სპორტული', cat_premium: 'პრემიუმი',
    fleet_eyebrow: 'ავტოპარკი', fleet_title: 'გამორჩეული ავტომობილები',
    fleet_empty: 'ამ კატეგორიაში მანქანა ვერ მოიძებნა.',
    cats_eyebrow: 'კატეგორიები', cats_title: 'აირჩიე შენი სტილით',
    why_eyebrow: 'რატომ CarCare', why_title: 'შენი კომფორტი — ჩვენი საზრუნავი',
    why1_t: 'სრული დაზღვევა', why1_d: 'ყველა ავტომობილი დაზღვეულია — იმგზავრე მშვიდად, დანარჩენს ჩვენ მოვუვლით.',
    why2_t: 'საუკეთესო ფასები', why2_d: 'გამჭვირვალე ტარიფები ფარული გადასახადების გარეშე — რასაც ხედავ, იმას იხდი.',
    why3_t: '24/7 მხარდაჭერა', why3_d: 'ნებისმიერ დროს დაგვიკავშირდი — ტელეფონით ან WhatsApp-ით, ყოველთვის ხაზზე ვართ.',
    why4_t: 'უფასო მიწოდება', why4_d: 'მანქანას მოგიყვანთ შენთვის სასურველ მისამართზე — აეროპორტში ან სასტუმროსთან.',
    rev_eyebrow: 'შეფასებები', rev_title: 'რას ამბობენ ჩვენი კლიენტები',
    rev1_q: '„მანქანა აეროპორტში დამხვდა სუფთა და გამართული. პროცესი 10 წუთში დასრულდა — ნამდვილად საუკეთესო სერვისი თბილისში."',
    rev1_n: 'გიორგი კაპანაძე', rev1_c: 'თბილისი',
    rev2_q: '„ბათუმში ერთი კვირით ვიქირავეთ ჯიპი. ფასი ზუსტად ის იყო, რაც საიტზე ეწერა — არანაირი დამატებითი გადასახადი."',
    rev2_n: 'ნინო ბერიძე', rev2_c: 'ბათუმი',
    rev3_q: '„გზაში პატარა პრობლემა შეგვექმნა და 24/7 მხარდაჭერამ მაშინვე გადაჭრა. ასეთი მომსახურება იშვიათია."',
    rev3_n: 'დავით მაისურაძე', rev3_c: 'ქუთაისი',
    cta_eyebrow: 'დაჯავშნა მარტივად', cta_title: 'დაჯავშნე მანქანა დღესვე',
    cta_sub: 'მოგვწერე WhatsApp-ში ან დაგვირეკე — მანქანა მზად იქნება რამდენიმე საათში.',
    cta_wa: 'მოგვწერე WhatsApp-ში',
    foot_about: 'ავტომობილების გაქირავების სერვისი მთელი საქართველოს მასშტაბით. შენი სანდო პარტნიორი ყველა მოგზაურობაში.',
    foot_nav: 'ნავიგაცია', foot_cats: 'კატეგორიები', foot_contact: 'კონტაქტი',
    foot_addr: 'თბილისი, საქართველო', foot_hours: 'ყოველდღე · 24/7',
    foot_rights: 'ყველა უფლება დაცულია.',
    per_day: 'დღეში', seats: 'ადგილი', book: 'დაჯავშნა', tag_top: 'ტოპ არჩევანი',
    wa_msg: 'გამარჯობა, მინდა დავჯავშნო: '
  },
  en: {
    nav_home: 'Home', nav_fleet: 'Fleet', nav_categories: 'Categories',
    nav_why: 'Why Us', nav_contact: 'Contact', nav_cta: 'Book Now',
    hero_l1: 'Find Your Perfect Car', hero_l2: 'Drive Your Dreams',
    hero_sub: 'Renting made simple — a modern fleet, full insurance and transparent pricing. Pick up today, drive freely.',
    hero_btn1: 'Browse Fleet', hero_btn2: 'Contact Us',
    stat_cars: 'Vehicles', stat_support: 'Support', stat_ins: 'Insurance', stat_ins_v: 'Full',
    badge_rating: 'Customer rating',
    s_loc: 'Pick-up location', s_from: 'Pick-up date', s_to: 'Return date',
    s_cat: 'Category', s_btn: 'Search',
    s_loc_tbilisi: 'Tbilisi', s_loc_airport: 'Tbilisi Airport', s_loc_batumi: 'Batumi', s_loc_kutaisi: 'Kutaisi',
    cat_all: 'All', cat_sedan: 'Sedan', cat_suv: 'SUV', cat_sport: 'Sport', cat_premium: 'Premium',
    fleet_eyebrow: 'Our Fleet', fleet_title: 'Featured Vehicles',
    fleet_empty: 'No cars found in this category.',
    cats_eyebrow: 'Categories', cats_title: 'Choose Your Style',
    why_eyebrow: 'Why CarCare', why_title: 'Your Comfort Is Our Priority',
    why1_t: 'Full Insurance', why1_d: 'Every vehicle is fully insured — travel with peace of mind, we handle the rest.',
    why2_t: 'Best Prices', why2_d: 'Transparent rates with no hidden fees — what you see is what you pay.',
    why3_t: '24/7 Support', why3_d: 'Reach us anytime — by phone or WhatsApp, we are always online.',
    why4_t: 'Free Delivery', why4_d: 'We deliver the car to your address — at the airport or your hotel.',
    rev_eyebrow: 'Reviews', rev_title: 'What Our Clients Say',
    rev1_q: '"The car was waiting at the airport, clean and ready. The whole process took 10 minutes — truly the best service in Tbilisi."',
    rev1_n: 'Giorgi Kapanadze', rev1_c: 'Tbilisi',
    rev2_q: '"We rented an SUV in Batumi for a week. The price was exactly as listed — no extra charges at all."',
    rev2_n: 'Nino Beridze', rev2_c: 'Batumi',
    rev3_q: '"We had a small issue on the road and 24/7 support solved it instantly. Service like this is rare."',
    rev3_n: 'Davit Maisuradze', rev3_c: 'Kutaisi',
    cta_eyebrow: 'Easy Booking', cta_title: 'Book Your Car Today',
    cta_sub: 'Message us on WhatsApp or give us a call — your car will be ready within hours.',
    cta_wa: 'Message on WhatsApp',
    foot_about: 'Car rental service across all of Georgia. Your trusted partner for every journey.',
    foot_nav: 'Navigation', foot_cats: 'Categories', foot_contact: 'Contact',
    foot_addr: 'Tbilisi, Georgia', foot_hours: 'Every day · 24/7',
    foot_rights: 'All rights reserved.',
    per_day: 'per day', seats: 'seats', book: 'Book Now', tag_top: 'Top Choice',
    wa_msg: 'Hello, I would like to book: '
  }
};

let lang = localStorage.getItem('cc-lang') || 'ka';
const t = (key) => (I18N[lang] && I18N[lang][key]) || I18N.ka[key] || key;

/* ================== FLEET RENDER ================== */
const fleetGrid = document.getElementById('fleetGrid');
const fleetEmpty = document.getElementById('fleetEmpty');
let activeCat = 'all';

const SPEC_ICONS = {
  gear: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="6" cy="6" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="6" cy="18" r="2.4"/><path d="M6 8.4v7.2M18 8.4V12a2 2 0 0 1-2 2H8.4"/></svg>',
  fuel: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h14M15 9h2.5a1.5 1.5 0 0 1 1.5 1.5V17a1.5 1.5 0 0 0 3 0v-6.5L19 7.5M7.5 7h5v4h-5z"/></svg>',
  seats: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 11V6a3 3 0 0 1 6 0v5M7 11h9a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H8a3 3 0 0 1-3-3v-8"/><path d="M7 18v3m8-3v3"/></svg>'
};

function carCard(car) {
  const wa = 'https://wa.me/995577449977?text=' + encodeURIComponent(t('wa_msg') + car.name + ' (' + car.year + ')');
  return `
  <article class="car-card" data-cat="${car.cat}">
    <div class="car-img">
      <img src="${car.img}" alt="${car.name}" width="800" height="500" loading="lazy">
      ${car.tag ? `<span class="car-tag">${t('tag_top')}</span>` : ''}
    </div>
    <div class="car-body">
      <div class="car-top">
        <div>
          <h3 class="car-name">${car.name}</h3>
          <span class="car-year">${car.year} · ${t('cat_' + car.cat).split(' ')[0]}</span>
        </div>
        <div class="car-price">
          <strong>${car.price}₾</strong>
          <span>${t('per_day')}</span>
        </div>
      </div>
      <ul class="car-specs">
        <li>${SPEC_ICONS.gear}${car.gear[lang] || car.gear.ka}</li>
        <li>${SPEC_ICONS.fuel}${car.fuel[lang] || car.fuel.ka}</li>
        <li>${SPEC_ICONS.seats}${car.seats} ${t('seats')}</li>
      </ul>
      <a href="${wa}" class="btn btn-primary car-book" target="_blank" rel="noopener">${t('book')}</a>
    </div>
  </article>`;
}

function renderFleet() {
  const list = activeCat === 'all' ? CARS : CARS.filter(c => c.cat === activeCat);
  fleetGrid.innerHTML = list.map(carCard).join('');
  fleetEmpty.hidden = list.length > 0;
}

/* filters */
document.getElementById('fleetFilters').addEventListener('click', (e) => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  activeCat = btn.dataset.cat;
  document.querySelectorAll('#fleetFilters .chip').forEach(c => c.classList.toggle('active', c === btn));
  renderFleet();
});

/* category tiles + footer links → filter fleet */
function filterAndGo(cat) {
  activeCat = cat;
  document.querySelectorAll('#fleetFilters .chip').forEach(c => c.classList.toggle('active', c.dataset.cat === cat));
  renderFleet();
  document.getElementById('fleet').scrollIntoView({ behavior: 'smooth' });
}
document.querySelectorAll('.cat-tile').forEach(tile =>
  tile.addEventListener('click', () => filterAndGo(tile.dataset.cat))
);
document.querySelectorAll('[data-cat-link]').forEach(a =>
  a.addEventListener('click', () => filterAndGo(a.dataset.catLink))
);

/* search bar */
document.getElementById('searchBar').addEventListener('submit', (e) => {
  e.preventDefault();
  filterAndGo(document.getElementById('sCat').value);
});

/* ================== LANGUAGE ================== */
function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('.lang-opt').forEach(o =>
    o.classList.toggle('active', o.dataset.lang === lang)
  );
  renderFleet();
}
document.getElementById('langSwitch').addEventListener('click', () => {
  lang = lang === 'ka' ? 'en' : 'ka';
  localStorage.setItem('cc-lang', lang);
  applyLang();
});

/* ================== NAVBAR ================== */
const navbar = document.getElementById('navbar');
let lastY = 0;
let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 30);
    if (y > lastY && y > 220) navbar.classList.add('hidden');
    else navbar.classList.remove('hidden');
    lastY = y;
    ticking = false;
  });
}, { passive: true });

/* burger */
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
burger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
});
mobileMenu.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    mobileMenu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }
});

/* active nav link on scroll */
const sections = ['top', 'fleet', 'categories', 'why', 'contact'];
const navLinks = document.querySelectorAll('.nav-link');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(id => {
  const el = document.getElementById(id);
  if (el) sectionObserver.observe(el);
});

/* ================== REVEAL ================== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add('in');
      revealObserver.unobserve(en.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ================== DATES ================== */
const today = new Date();
const fmt = (d) => d.toISOString().slice(0, 10);
const from = document.getElementById('sFrom');
const to = document.getElementById('sTo');
from.min = fmt(today);
from.value = fmt(today);
const ret = new Date(today);
ret.setDate(ret.getDate() + 3);
to.min = fmt(today);
to.value = fmt(ret);
from.addEventListener('change', () => { to.min = from.value; if (to.value < from.value) to.value = from.value; });

/* ================== INIT ================== */
applyLang();
