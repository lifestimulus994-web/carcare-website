/* ================== DATA (loaded from Supabase — see js/supabase-client.js) ================== */
let CARS = [];

async function loadCars() {
  const { data, error } = await sb
    .from('cars')
    .select('*')
    .eq('active', true)
    .order('popularity', { ascending: false });
  if (error) { console.error('loadCars failed:', error); return; }
  CARS = data.map(row => ({
    id: row.id, name: row.name, year: row.year, cat: row.category,
    price: row.price_multiday, price1: row.price_1day, priceMulti: row.price_multiday,
    img: row.image_url, tag: row.featured, popularity: row.popularity,
    gear: row.gearbox, fuel: row.fuel, engine: row.engine, seats: row.seats
  }));
  renderFleet();
}

/* ================== CATEGORIES (loaded from Supabase, admin-managed) ================== */
let CATEGORIES = [];

const CAT_ICONS = {
  sedan: '<svg viewBox="0 0 48 24" width="52" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 17h40M6 17l2-5h9l4-4h10l6 4h7l2 5"/><circle cx="13" cy="17" r="2.6"/><circle cx="36" cy="17" r="2.6"/></svg>',
  suv: '<svg viewBox="0 0 48 24" width="52" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 16h40M5 16l2-7h13l3-4h12l5 6h5l1 5"/><circle cx="13" cy="16" r="3"/><circle cx="36" cy="16" r="3"/></svg>',
  sport: '<svg viewBox="0 0 48 24" width="52" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 18h40M6 18l3-4 8-2 6-5h8l8 7h6l1 4"/><circle cx="13" cy="18" r="2.4"/><circle cx="37" cy="18" r="2.4"/></svg>',
  premium: '<svg viewBox="0 0 48 24" width="52" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 17h40M7 17l1-6h12l5-5h9l7 6h5l1 5"/><circle cx="14" cy="17" r="2.6"/><circle cx="35" cy="17" r="2.6"/><path d="M24 6l1.2 2.5L28 9l-2.2 2 .5 3-2.3-1.5L21.7 14l.5-3L20 9l2.8-.5L24 6z" fill="currentColor" stroke="none" opacity=".9"/></svg>',
  default: '<svg viewBox="0 0 48 24" width="52" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 17h40M6 17l2-6h28l2 6"/><circle cx="14" cy="17" r="2.6"/><circle cx="34" cy="17" r="2.6"/></svg>'
};

function categoryLabel(slug) {
  const c = CATEGORIES.find(c => c.slug === slug);
  if (!c) return slug;
  return (lang === 'en' ? c.label_en : c.label_ka) || c.label_ka;
}

async function loadCategories() {
  const { data, error } = await sb.from('categories').select('*').eq('active', true).order('sort_order');
  if (error) { console.error('loadCategories failed:', error); return; }
  CATEGORIES = data;
  renderCategoryUI();
  renderFleet();
}

function renderCategoryUI() {
  const fleetFilters = document.getElementById('fleetFilters');
  const catGrid = document.getElementById('catGrid');
  const sCat = document.getElementById('sCat');
  const footCatLinks = document.getElementById('footCatLinks');

  fleetFilters.innerHTML = `<button class="chip${activeCat === 'all' ? ' active' : ''}" data-cat="all">${t('cat_all')}</button>` +
    CATEGORIES.map(c => `<button class="chip${activeCat === c.slug ? ' active' : ''}" data-cat="${c.slug}">${lang === 'en' ? c.label_en : c.label_ka}</button>`).join('');

  catGrid.innerHTML = CATEGORIES.map((c, i) => `
    <button class="cat-tile reveal d${i}" data-cat="${c.slug}">
      ${CAT_ICONS[c.slug] || CAT_ICONS.default}
      <span>${lang === 'en' ? c.label_en : c.label_ka}</span>
    </button>`).join('');
  catGrid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  sCat.innerHTML = `<option value="all">${t('cat_all')}</option>` +
    CATEGORIES.map(c => `<option value="${c.slug}">${lang === 'en' ? c.label_en : c.label_ka}</option>`).join('');

  footCatLinks.innerHTML = CATEGORIES.map(c => `<a href="#fleet" data-cat-link="${c.slug}">${lang === 'en' ? c.label_en : c.label_ka}</a>`).join('');
}

/* ================== SITE TEXTS (admin-editable copy, overrides the defaults below) ================== */
async function loadSiteTexts() {
  const { data, error } = await sb.from('site_texts').select('key,value_ka,value_en');
  if (error) { console.error('loadSiteTexts failed:', error); return; }
  data.forEach(row => {
    if (row.value_ka) I18N.ka[row.key] = row.value_ka;
    if (row.value_en) I18N.en[row.key] = row.value_en;
  });
  applyLang();
}

/* ================== ADDONS ================== */
const ADDONS = [
  { id: 'childseat', price: 15, per: 'day', ka: 'საბავშვო სავარძელი', en: 'Child Seat' },
  { id: 'sim', price: 5, per: 'flat', ka: 'SIM ბარათი', en: 'SIM Card' },
  { id: 'insurance', price: 20, per: 'day', ka: 'სრული დაზღვევა', en: 'Full Insurance' },
  { id: 'driver', price: 10, per: 'day', ka: 'დამატებითი მძღოლი', en: 'Additional Driver' },
  { id: 'airport', price: 25, per: 'flat', ka: 'მიწოდება აეროპორტში', en: 'Airport Delivery' },
  { id: 'hotel', price: 20, per: 'flat', ka: 'მიწოდება სასტუმროში', en: 'Hotel Delivery' },
  { id: 'wifi', price: 8, per: 'day', ka: 'შეუზღუდავი ინტერნეტი', en: 'Unlimited Internet' }
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
    cat_all: 'ყველა',
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
    wa_msg: 'გამარჯობა, მინდა დავჯავშნო: ',
    nav_faq: 'კითხვები',
    sort_price_asc: 'ფასი: დაბლიდან მაღლა', sort_price_desc: 'ფასი: მაღლიდან დაბლა',
    sort_popular: 'პოპულარობით', sort_newest: 'უახლესი მანქანები',
    search_ph: 'მოძებნე მოდელი (მაგ: BMW)', search_empty: 'მანქანა ვერ მოიძებნა',
    faq_eyebrow: 'დახმარება', faq_title: 'ხშირად დასმული კითხვები',
    faq_cat_booking: 'დაჯავშნა', faq_cat_insurance: 'დაზღვევა', faq_cat_payment: 'გადახდა',
    faq_cat_delivery: 'მიწოდება', faq_cat_cancel: 'გაუქმება',
    faq_b1_q: 'როგორ დავჯავშნო მანქანა?',
    faq_b1_a: 'აირჩიე მანქანა ავტოპარკიდან, მიუთითე თარიღები და დაასრულე ჯავშანი "დაჯავშნა" ღილაკზე დაჭერით — ჩვენი გუნდი დაუყოვნებლივ დაგიდასტურებთ.',
    faq_b2_q: 'რამდენი ხნით ადრე უნდა დავჯავშნო?',
    faq_b2_a: 'სასურველია მინიმუმ 24 საათით ადრე, თუმცა სეზონზე მოთხოვნის გამო რეკომენდებულია რაც შეიძლება ადრე დაჯავშნა.',
    faq_b3_q: 'შემიძლია ჯავშნის ცვლილება?',
    faq_b3_a: 'დიახ, თარიღების ან მანქანის შეცვლა შესაძლებელია აღების დრომდე — დაგვიკავშირდი WhatsApp-ით ან ტელეფონით.',
    faq_i1_q: 'რა სახის დაზღვევა შედის ფასში?',
    faq_i1_a: 'ყველა მანქანას აქვს საბაზისო დაზღვევა ჩართული ფასში, რომელიც ფარავს ძირითად რისკებს.',
    faq_i2_q: 'რას მოიცავს სრული დაზღვევა?',
    faq_i2_a: 'სრული დაზღვევა (დამატებითი სერვისი) ამცირებს პასუხისმგებლობას დაზიანების შემთხვევაში თითქმის ნულამდე.',
    faq_i3_q: 'რა ხდება ავარიის შემთხვევაში?',
    faq_i3_a: 'დაუყოვნებლივ დაგვიკავშირდი — ჩვენი გუნდი გატარებს პროცედურას დაზღვევის კომპანიასთან ერთად.',
    faq_p1_q: 'რა გადახდის მეთოდებია ხელმისაწვდომი?',
    faq_p1_a: 'ნაღდი ანგარიშსწორება, საბანკო ბარათი ან გადარიცხვა — მანქანის აღებისას ან წინასწარ.',
    faq_p2_q: 'საჭიროა თუ არა დეპოზიტი?',
    faq_p2_a: 'დიახ, აღების დროს ბრუნდებადი დეპოზიტი გადაიხდევინება, რომელიც სრულად უბრუნდება მანქანის დაბრუნებისას.',
    faq_p3_q: 'არის დამალული გადასახადები?',
    faq_p3_a: 'არა — ფასი, რომელსაც ხედავ საიტზე, არის საბოლოო ფასი (გარდა შენ მიერ არჩეული დამატებითი სერვისებისა).',
    faq_d1_q: 'მანქანას მომაწვდიან თუ თვითონ მივიდე?',
    faq_d1_a: 'შეგვიძლია მანქანა მოგიტანოთ აეროპორტში, სასტუმროში ან სასურველ მისამართზე დამატებითი სერვისის სახით.',
    faq_d2_q: 'რამდენ ხანში ხდება მიწოდება?',
    faq_d2_a: 'აეროპორტში ან სასტუმროში მიწოდება საშუალოდ 30-60 წუთში ხდება, შეთანხმებული დროის მიხედვით.',
    faq_d3_q: 'მუშაობთ ქალაქგარეთაც?',
    faq_d3_a: 'დიახ, ვმუშაობთ თბილისში, ბათუმსა და ქუთაისში — სხვა ლოკაციაზე დეტალებისთვის დაგვიკავშირდი.',
    faq_c1_q: 'შემიძლია ჯავშნის გაუქმება?',
    faq_c1_a: 'დიახ, გაუქმება უფასოა თუ მოხდება აღებამდე 24 საათით ადრე მაინც.',
    faq_c2_q: 'დაბრუნდება თუ არა გადახდილი თანხა?',
    faq_c2_a: '24 საათზე ადრე გაუქმებისას თანხა სრულად ბრუნდება; უფრო გვიან გაუქმებისას შესაძლოა დაერიცხოს მცირე საკომისიო.',
    faq_c3_q: 'როგორ გავაუქმო ჯავშანი?',
    faq_c3_a: 'მოგვწერე WhatsApp-ში ან დაგვირეკე ჯავშნის ნომრით — გავაუქმებთ დაუყოვნებლივ.',
    book_modal_eyebrow: 'დაჯავშნა', book_modal_title: 'დაასრულე ჯავშანი',
    cal_label: 'აირჩიე თარიღები', cal_pick: 'აღება', cal_return: 'დაბრუნება',
    cal_legend_free: 'თავისუფალია', cal_legend_booked: 'დაკავებულია', cal_legend_sel: 'არჩეული',
    addons_label: 'დამატებითი სერვისები',
    price_label: 'ფასის დეტალები', price_daily: 'დღიური ფასი', price_days: 'დღეების რაოდენობა',
    price_addons: 'დამატებითი გადასახადები', price_deposit: 'დეპოზიტი (ბრუნდება)',
    price_insurance: 'დაზღვევა', price_insurance_basic: 'საბაზისო — შედის ფასში',
    price_insurance_full: 'სრული დაზღვევა დამატებულია',
    price_total: 'ჯამური ფასი', price_includes_title: 'რას მოიცავს ფასი',
    incl1: 'შეუზღუდავი გარბენი', incl2: 'საბაზისო დაზღვევა', incl3: '24/7 მხარდაჭერა',
    incl4: 'უფასო წაყვანა-მოყვანა ქალაქში',
    book_confirm: 'ჯავშნის დადასტურება WhatsApp-ით',
    day_short: 'დღე', flat_short: 'ერთჯერადი',
    terms_title: 'წესები და პირობები',
    foot_terms: 'წესები და პირობები',
    loc_eyebrow: 'სად ვართ', loc_title: 'ჩვენი ლოკაცია',
    loc_addr_t: 'მისამართი', loc_hours_t: 'სამუშაო საათები', loc_methods_t: 'დაგვიკავშირდი',
    terms_h1: 'გაქირავების პირობები',
    terms_h1_1: 'მძღოლს უნდა ჰქონდეს მინიმუმ 21 წელი და მინიმუმ 1 წლიანი მართვის გამოცდილება.',
    terms_h1_2: 'საჭიროა მოქმედი მართვის მოწმობა და პირადობის დამადასტურებელი დოკუმენტი.',
    terms_h1_3: 'მანქანა გაიცემა და მიიღება შეთანხმებულ ლოკაციაზე, შეთანხმებულ დროს.',
    terms_h2: 'დეპოზიტი და გადახდა',
    terms_h2_1: 'ბრუნდებადი დეპოზიტი გადაიხდევინება მანქანის აღებისას და ბრუნდება დაზიანების არარსებობის შემთხვევაში.',
    terms_h2_2: 'ჯამური ღირებულება მოიცავს დღიურ ტარიფს — დამატებითი სერვისები ცალკე ანგარიშდება.',
    terms_h3: 'საწვავი და გარბენი',
    terms_h3_1: 'მანქანა გაიცემა სავსე ბაკით და უნდა დაბრუნდეს იმავე დონეზე.',
    terms_h3_2: 'გარბენზე შეზღუდვა არ ვრცელდება სტანდარტულ ჯავშანზე.',
    terms_h4: 'გაუქმება',
    terms_h4_1: 'უფასო გაუქმება შესაძლებელია აღებამდე 24 საათით ადრე.',
    terms_h4_2: 'უფრო გვიან გაუქმებისას შესაძლოა დაერიცხოს მცირე საკომისიო.'
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
    cat_all: 'All',
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
    wa_msg: 'Hello, I would like to book: ',
    nav_faq: 'FAQ',
    sort_price_asc: 'Price: Low to High', sort_price_desc: 'Price: High to Low',
    sort_popular: 'Most Popular', sort_newest: 'Newest Cars',
    search_ph: 'Search model (e.g. BMW)', search_empty: 'No matches found',
    faq_eyebrow: 'Help', faq_title: 'Frequently Asked Questions',
    faq_cat_booking: 'Booking', faq_cat_insurance: 'Insurance', faq_cat_payment: 'Payment',
    faq_cat_delivery: 'Delivery', faq_cat_cancel: 'Cancellation',
    faq_b1_q: 'How do I book a car?',
    faq_b1_a: 'Choose a car from the fleet, pick your dates and finish your booking with the "Book Now" button — our team confirms it right away.',
    faq_b2_q: 'How far in advance should I book?',
    faq_b2_a: 'At least 24 hours ahead is best, though during high season we recommend booking as early as possible.',
    faq_b3_q: 'Can I change my booking?',
    faq_b3_a: 'Yes, dates or the car itself can be changed before pick-up — reach us on WhatsApp or by phone.',
    faq_i1_q: 'What insurance is included in the price?',
    faq_i1_a: 'Every car comes with basic insurance included in the price, covering the main risks.',
    faq_i2_q: "What does full insurance cover?",
    faq_i2_a: 'Full insurance (an add-on) reduces your liability for damage to nearly zero.',
    faq_i3_q: 'What happens in case of an accident?',
    faq_i3_a: 'Contact us immediately — our team will handle the process together with the insurance company.',
    faq_p1_q: 'What payment methods are available?',
    faq_p1_a: 'Cash, card, or bank transfer — at pick-up or in advance.',
    faq_p2_q: 'Is a deposit required?',
    faq_p2_a: 'Yes, a refundable deposit is taken at pick-up and returned in full when the car is returned.',
    faq_p3_q: 'Are there any hidden fees?',
    faq_p3_a: 'No — the price you see on the site is the final price (except for any add-ons you choose).',
    faq_d1_q: 'Will the car be delivered, or do I pick it up myself?',
    faq_d1_a: 'We can deliver the car to the airport, your hotel, or any address as an add-on service.',
    faq_d2_q: 'How long does delivery take?',
    faq_d2_a: 'Airport or hotel delivery takes about 30-60 minutes on average, depending on the agreed time.',
    faq_d3_q: 'Do you operate outside the city?',
    faq_d3_a: 'Yes, we operate in Tbilisi, Batumi and Kutaisi — contact us for details on other locations.',
    faq_c1_q: 'Can I cancel my booking?',
    faq_c1_a: 'Yes, cancellation is free if made at least 24 hours before pick-up.',
    faq_c2_q: 'Will I get my payment back?',
    faq_c2_a: 'Cancelling more than 24 hours ahead gets a full refund; later cancellations may incur a small fee.',
    faq_c3_q: 'How do I cancel a booking?',
    faq_c3_a: 'Message us on WhatsApp or call with your booking details — we will cancel it right away.',
    book_modal_eyebrow: 'Booking', book_modal_title: 'Complete Your Booking',
    cal_label: 'Select Dates', cal_pick: 'Pick-up', cal_return: 'Return',
    cal_legend_free: 'Available', cal_legend_booked: 'Booked', cal_legend_sel: 'Selected',
    addons_label: 'Additional Services',
    price_label: 'Price Details', price_daily: 'Daily Rate', price_days: 'Number of Days',
    price_addons: 'Additional Fees', price_deposit: 'Deposit (refundable)',
    price_insurance: 'Insurance', price_insurance_basic: 'Basic — included',
    price_insurance_full: 'Full insurance added',
    price_total: 'Total Price', price_includes_title: "What's Included",
    incl1: 'Unlimited mileage', incl2: 'Basic insurance', incl3: '24/7 support',
    incl4: 'Free pick-up in city',
    book_confirm: 'Confirm via WhatsApp',
    day_short: 'day', flat_short: 'one-time',
    terms_title: 'Terms & Conditions',
    foot_terms: 'Terms & Conditions',
    loc_eyebrow: 'Find Us', loc_title: 'Our Location',
    loc_addr_t: 'Address', loc_hours_t: 'Working Hours', loc_methods_t: 'Contact Us',
    terms_h1: 'Rental Requirements',
    terms_h1_1: 'The driver must be at least 21 years old with a minimum of 1 year of driving experience.',
    terms_h1_2: "A valid driver's license and a government-issued ID are required.",
    terms_h1_3: 'The car is handed over and returned at the agreed location and time.',
    terms_h2: 'Deposit & Payment',
    terms_h2_1: 'A refundable deposit is charged at pick-up and returned in full if the car is undamaged.',
    terms_h2_2: 'The total cost includes the daily rate — additional services are billed separately.',
    terms_h3: 'Fuel & Mileage',
    terms_h3_1: 'The car is handed over with a full tank and must be returned at the same level.',
    terms_h3_2: 'No mileage limit applies to standard bookings.',
    terms_h4: 'Cancellation',
    terms_h4_1: 'Free cancellation is available up to 24 hours before pick-up.',
    terms_h4_2: 'Later cancellations may incur a small fee.'
  }
};

const MONTHS = {
  ka: ['იანვარი','თებერვალი','მარტი','აპრილი','მაისი','ივნისი','ივლისი','აგვისტო','სექტემბერი','ოქტომბერი','ნოემბერი','დეკემბერი'],
  en: ['January','February','March','April','May','June','July','August','September','October','November','December']
};
const WEEKDAYS = {
  ka: ['ორშ','სამ','ოთხ','ხუთ','პარ','შაბ','კვ'],
  en: ['Mo','Tu','We','Th','Fr','Sa','Su']
};

let lang = localStorage.getItem('cc-lang') || 'ka';
const t = (key) => (I18N[lang] && I18N[lang][key]) || I18N.ka[key] || key;

/* ================== FLEET RENDER ================== */
const fleetGrid = document.getElementById('fleetGrid');
const fleetEmpty = document.getElementById('fleetEmpty');
let activeCat = 'all';
let activeSort = 'popular';
let searchQuery = '';

const SORTERS = {
  popular: (a, b) => b.popularity - a.popularity,
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price,
  newest: (a, b) => b.year - a.year
};

const SPEC_ICONS = {
  gear: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="6" cy="6" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="6" cy="18" r="2.4"/><path d="M6 8.4v7.2M18 8.4V12a2 2 0 0 1-2 2H8.4"/></svg>',
  fuel: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h14M15 9h2.5a1.5 1.5 0 0 1 1.5 1.5V17a1.5 1.5 0 0 0 3 0v-6.5L19 7.5M7.5 7h5v4h-5z"/></svg>',
  seats: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 11V6a3 3 0 0 1 6 0v5M7 11h9a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H8a3 3 0 0 1-3-3v-8"/><path d="M7 18v3m8-3v3"/></svg>'
};

function carCard(car) {
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
          <span class="car-year">${car.year} · ${categoryLabel(car.cat).split(' ')[0]}</span>
        </div>
        <div class="car-price">
          <strong>${car.price}₾</strong>
          <span>${t('per_day')}</span>
        </div>
      </div>
      <ul class="car-specs">
        <li>${SPEC_ICONS.gear}${car.gear}</li>
        <li>${SPEC_ICONS.fuel}${car.fuel}</li>
        <li>${SPEC_ICONS.seats}${car.seats} ${t('seats')}</li>
      </ul>
      <button type="button" class="btn btn-primary car-book" data-book="${car.id}">${t('book')}</button>
    </div>
  </article>`;
}

function renderFleet() {
  let list = activeCat === 'all' ? CARS.slice() : CARS.filter(c => c.cat === activeCat);
  if (searchQuery) list = list.filter(c => c.name.toLowerCase().includes(searchQuery));
  list.sort(SORTERS[activeSort] || SORTERS.popular);
  fleetGrid.innerHTML = list.map(carCard).join('');
  fleetEmpty.hidden = list.length > 0;
}

/* open booking modal from car card */
fleetGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-book]');
  if (btn) openBookingModal(btn.dataset.book);
});

/* ================== MODEL SEARCH (autocomplete) ================== */
const modelSearch = document.getElementById('modelSearch');
const searchSuggest = document.getElementById('searchSuggest');

function suggestList(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return CARS.filter(c => c.name.toLowerCase().includes(q)).slice(0, 6);
}

function renderSuggestions(query) {
  const matches = suggestList(query);
  if (!query.trim()) { searchSuggest.hidden = true; searchSuggest.innerHTML = ''; return; }
  searchSuggest.innerHTML = matches.length
    ? matches.map(c => `<button type="button" class="suggest-item" data-pick="${c.id}"><span>${c.name}</span><span>${c.price}₾</span></button>`).join('')
    : `<div class="suggest-empty">${t('search_empty')}</div>`;
  searchSuggest.hidden = false;
}

if (modelSearch) {
  modelSearch.addEventListener('input', () => {
    searchQuery = modelSearch.value.trim().toLowerCase();
    activeCat = 'all';
    document.querySelectorAll('#fleetFilters .chip').forEach(c => c.classList.toggle('active', c.dataset.cat === 'all'));
    renderFleet();
    renderSuggestions(modelSearch.value);
  });
  modelSearch.addEventListener('focus', () => renderSuggestions(modelSearch.value));
  searchSuggest.addEventListener('click', (e) => {
    const item = e.target.closest('[data-pick]');
    if (!item) return;
    const car = CARS.find(c => c.id === item.dataset.pick);
    if (!car) return;
    modelSearch.value = car.name;
    searchQuery = car.name.toLowerCase();
    renderFleet();
    searchSuggest.hidden = true;
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.fleet-search')) searchSuggest.hidden = true;
  });
}

/* ================== FLEET SORT ================== */
const fleetSort = document.getElementById('fleetSort');
if (fleetSort) {
  fleetSort.addEventListener('change', () => {
    activeSort = fleetSort.value;
    renderFleet();
  });
}

/* filters */
document.getElementById('fleetFilters').addEventListener('click', (e) => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  activeCat = btn.dataset.cat;
  document.querySelectorAll('#fleetFilters .chip').forEach(c => c.classList.toggle('active', c === btn));
  renderFleet();
});

/* category tiles + footer links → filter fleet (delegated: both containers are
   filled dynamically by loadCategories(), so the elements don't exist at page load) */
function filterAndGo(cat) {
  activeCat = cat;
  document.querySelectorAll('#fleetFilters .chip').forEach(c => c.classList.toggle('active', c.dataset.cat === cat));
  renderFleet();
  document.getElementById('fleet').scrollIntoView({ behavior: 'smooth' });
}
document.getElementById('catGrid').addEventListener('click', (e) => {
  const tile = e.target.closest('.cat-tile');
  if (tile) filterAndGo(tile.dataset.cat);
});
document.getElementById('footCatLinks').addEventListener('click', (e) => {
  const a = e.target.closest('[data-cat-link]');
  if (a) filterAndGo(a.dataset.catLink);
});

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
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  document.querySelectorAll('.lang-opt').forEach(o =>
    o.classList.toggle('active', o.dataset.lang === lang)
  );
  if (CATEGORIES.length) renderCategoryUI();
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
const sections = ['top', 'fleet', 'categories', 'why', 'faq', 'contact'];
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

/* ================== MODALS (generic open/close) ================== */
function openModal(backdrop) {
  backdrop.classList.add('open');
  backdrop.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeModal(backdrop) {
  backdrop.classList.remove('open');
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
document.querySelectorAll('.modal-backdrop').forEach(bd => {
  bd.addEventListener('click', (e) => { if (e.target === bd) closeModal(bd); });
  bd.querySelectorAll('.modal-close').forEach(btn => btn.addEventListener('click', () => closeModal(bd)));
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('.modal-backdrop.open').forEach(bd => closeModal(bd));
});

/* ================== TERMS MODAL ================== */
const termsModal = document.getElementById('termsModal');
document.querySelectorAll('.js-terms-link').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    if (termsModal) openModal(termsModal);
  });
});

/* ================== FAQ (tabs + accordion) ================== */
let activeFaqCat = 'booking';
const faqTabs = document.getElementById('faqTabs');
if (faqTabs) {
  faqTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-faqcat]');
    if (!btn) return;
    activeFaqCat = btn.dataset.faqcat;
    faqTabs.querySelectorAll('[data-faqcat]').forEach(c => c.classList.toggle('active', c === btn));
    document.querySelectorAll('.faq-item').forEach(item => {
      item.hidden = item.dataset.cat !== activeFaqCat;
    });
  });
}
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => btn.closest('.faq-item').classList.toggle('open'));
});

/* ================== BOOKING MODAL ================== */
const bookingModal = document.getElementById('bookingModal');
const calGrid = document.getElementById('calGrid');
const calTitle = document.getElementById('calTitle');
const calRangeTxt = document.getElementById('calRangeTxt');
const addonList = document.getElementById('addonList');

const bookState = {
  car: null,
  booked: new Set(),
  viewMonth: null,
  rangeStart: null,
  rangeEnd: null,
  addons: new Set()
};

/* parse a 'YYYY-MM-DD' string as a local date (not UTC) so it lines up with
   the locally-constructed calendar-grid dates once both go through fmt() */
function parseLocalDate(isoDateStr) {
  const [y, m, d] = isoDateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}
async function fetchBookedDates(carId) {
  const set = new Set();
  const { data, error } = await sb.from('booking_blocks').select('start_date,end_date').eq('car_id', carId);
  if (error) { console.error('fetchBookedDates failed:', error); return set; }
  data.forEach(block => {
    const d = parseLocalDate(block.start_date);
    const end = parseLocalDate(block.end_date);
    while (d <= end) { set.add(fmt(d)); d.setDate(d.getDate() + 1); }
  });
  return set;
}
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function daysBetween(a, b) {
  const ms = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  return Math.round(ms / 86400000);
}
function firstAvailable(booked, from) {
  const d = new Date(from); d.setHours(0, 0, 0, 0);
  let i = 0;
  while (booked.has(fmt(d)) && i < 60) { d.setDate(d.getDate() + 1); i++; }
  return d;
}

async function openBookingModal(carId) {
  const car = CARS.find(c => c.id === carId);
  if (!car || !bookingModal) return;
  bookState.car = car;
  bookState.addons = new Set();
  bookState.booked = new Set();

  document.getElementById('modalCarImg').src = car.img;
  document.getElementById('modalCarImg').alt = car.name;
  document.getElementById('modalCarName').textContent = car.name;
  document.getElementById('modalCarMeta').textContent =
    car.year + ' · ' + car.engine + ' · ' + car.gear + ' · ' + car.price1 + '₾ (1 ' + t('day_short') + ') / ' + car.priceMulti + '₾ ' + t('per_day');

  /* open with a provisional range immediately — most days are free, so this
     already looks right; upgrade to the real booked-day set the moment it arrives.
     firstAvailable() also midnight-normalizes "today", which matters: the calendar
     grid's date keys are built from local-midnight Date objects, so the range
     start must be too, or the highlighted cell drifts by a day. */
  const provisionalStart = firstAvailable(bookState.booked, today);
  bookState.rangeStart = provisionalStart;
  bookState.rangeEnd = addDays(provisionalStart, 2);
  bookState.viewMonth = new Date(provisionalStart.getFullYear(), provisionalStart.getMonth(), 1);
  renderCalendar();
  renderAddons();
  updatePricing();
  openModal(bookingModal);

  bookState.booked = await fetchBookedDates(car.id);
  if (bookState.car !== car) return; // user opened a different car before this resolved
  const start = firstAvailable(bookState.booked, today);
  bookState.rangeStart = start;
  bookState.rangeEnd = addDays(start, 2);
  bookState.viewMonth = new Date(start.getFullYear(), start.getMonth(), 1);
  renderCalendar();
  updatePricing();
}

function renderCalendar() {
  if (!bookState.car) return;
  const y = bookState.viewMonth.getFullYear();
  const m = bookState.viewMonth.getMonth();
  calTitle.textContent = MONTHS[lang][m] + ' ' + y;

  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstDow = (new Date(y, m, 1).getDay() + 6) % 7; // Monday-first
  const todayMid = new Date(today); todayMid.setHours(0, 0, 0, 0);

  let html = WEEKDAYS[lang].map(d => `<div class="cal-dow">${d}</div>`).join('');
  for (let i = 0; i < firstDow; i++) html += `<div class="cal-day empty"></div>`;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(y, m, day);
    const key = fmt(date);
    const isPast = date < todayMid;
    const isBooked = bookState.booked.has(key);
    const isStart = bookState.rangeStart && fmt(bookState.rangeStart) === key;
    const isEnd = bookState.rangeEnd && fmt(bookState.rangeEnd) === key;
    const inRange = bookState.rangeStart && bookState.rangeEnd && date > bookState.rangeStart && date < bookState.rangeEnd;
    const cls = ['cal-day'];
    if (isPast) cls.push('past');
    if (isBooked) cls.push('booked');
    if (isStart) cls.push('range-start');
    if (isEnd) cls.push('range-end');
    if (inRange) cls.push('in-range');
    const disabled = isPast || isBooked;
    html += `<button type="button" class="${cls.join(' ')}" data-date="${key}" ${disabled ? 'disabled' : ''}>${day}</button>`;
  }
  calGrid.innerHTML = html;

  const startStr = bookState.rangeStart ? bookState.rangeStart.toLocaleDateString(lang === 'ka' ? 'ka-GE' : 'en-GB') : '—';
  const endStr = bookState.rangeEnd ? bookState.rangeEnd.toLocaleDateString(lang === 'ka' ? 'ka-GE' : 'en-GB') : '—';
  calRangeTxt.innerHTML = `${t('cal_pick')}: <strong>${startStr}</strong> &nbsp;→&nbsp; ${t('cal_return')}: <strong>${endStr}</strong>`;
}

calGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.cal-day:not(.empty):not(.past):not(.booked)');
  if (!btn) return;
  const picked = new Date(btn.dataset.date);
  if (!bookState.rangeStart || (bookState.rangeStart && bookState.rangeEnd)) {
    bookState.rangeStart = picked;
    bookState.rangeEnd = null;
  } else if (picked < bookState.rangeStart) {
    bookState.rangeEnd = bookState.rangeStart;
    bookState.rangeStart = picked;
  } else {
    bookState.rangeEnd = picked;
  }
  renderCalendar();
  updatePricing();
});

document.getElementById('calPrev').addEventListener('click', () => {
  const v = bookState.viewMonth;
  const prev = new Date(v.getFullYear(), v.getMonth() - 1, 1);
  const curMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  if (prev < curMonth) return;
  bookState.viewMonth = prev;
  renderCalendar();
});
document.getElementById('calNext').addEventListener('click', () => {
  const v = bookState.viewMonth;
  bookState.viewMonth = new Date(v.getFullYear(), v.getMonth() + 1, 1);
  renderCalendar();
});

function renderAddons() {
  addonList.innerHTML = ADDONS.map(a => `
    <label class="addon-item">
      <input type="checkbox" value="${a.id}">
      <span class="addon-name">${a[lang] || a.ka}</span>
      <span class="addon-price">+${a.price}₾ ${a.per === 'day' ? ('/ ' + t('day_short')) : ('· ' + t('flat_short'))}</span>
    </label>`).join('');
}
addonList.addEventListener('change', (e) => {
  const cb = e.target.closest('input[type="checkbox"]');
  if (!cb) return;
  if (cb.checked) bookState.addons.add(cb.value);
  else bookState.addons.delete(cb.value);
  updatePricing();
});

function updatePricing() {
  const car = bookState.car;
  if (!car) return;
  const days = Math.max(1, daysBetween(new Date(bookState.rangeStart), new Date(bookState.rangeEnd || addDays(bookState.rangeStart, 1))));
  const perDayRate = days === 1 ? car.price1 : car.priceMulti;
  const rentalTotal = days === 1 ? car.price1 : car.priceMulti * days;
  let addonsTotal = 0;
  ADDONS.forEach(a => {
    if (bookState.addons.has(a.id)) addonsTotal += a.per === 'day' ? a.price * days : a.price;
  });
  const total = rentalTotal + addonsTotal;
  const deposit = car.priceMulti * 2;

  document.getElementById('priceDaily').textContent = perDayRate + '₾' + (days === 1 ? ' (1 ' + t('day_short') + ')' : '');
  document.getElementById('priceDays').textContent = days;
  document.getElementById('priceAddons').textContent = addonsTotal + '₾';
  document.getElementById('priceDeposit').textContent = deposit + '₾';
  document.getElementById('priceInsurance').textContent = bookState.addons.has('insurance') ? t('price_insurance_full') : t('price_insurance_basic');
  document.getElementById('priceTotal').textContent = total + '₾';
}

document.getElementById('confirmBooking').addEventListener('click', () => {
  const car = bookState.car;
  if (!car) return;
  const days = Math.max(1, daysBetween(new Date(bookState.rangeStart), new Date(bookState.rangeEnd || addDays(bookState.rangeStart, 1))));
  const startStr = bookState.rangeStart.toLocaleDateString(lang === 'ka' ? 'ka-GE' : 'en-GB');
  const endStr = (bookState.rangeEnd || addDays(bookState.rangeStart, 1)).toLocaleDateString(lang === 'ka' ? 'ka-GE' : 'en-GB');
  const addonNames = ADDONS.filter(a => bookState.addons.has(a.id)).map(a => a[lang] || a.ka);
  const total = document.getElementById('priceTotal').textContent;

  let msg = t('wa_msg') + car.name + ' (' + car.year + ')\n';
  msg += t('cal_pick') + ': ' + startStr + '\n';
  msg += t('cal_return') + ': ' + endStr + '\n';
  msg += t('price_days') + ': ' + days + '\n';
  if (addonNames.length) msg += t('addons_label') + ': ' + addonNames.join(', ') + '\n';
  msg += t('price_total') + ': ' + total;

  window.open('https://wa.me/995577449977?text=' + encodeURIComponent(msg), '_blank', 'noopener');
});

/* re-sync open modal content on language switch */
const _applyLangBase = applyLang;
applyLang = function () {
  _applyLangBase();
  if (bookingModal && bookingModal.classList.contains('open')) {
    renderCalendar();
    renderAddons();
    updatePricing();
  }
};

/* ================== INIT ================== */
applyLang();
loadCategories();
loadCars();
loadSiteTexts();
