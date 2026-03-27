/* =============================================
   CHICKENTASTIC MENU — SCRIPT.JS  v4
   + combo_offer banner in items view
   + choices pills on item cards
   ============================================= */

let menuData = null;

const categoryView  = document.getElementById('category-view');
const itemsView     = document.getElementById('items-view');
const categoryGrid  = document.getElementById('category-grid');
const itemsGrid     = document.getElementById('items-grid');
const backBtn       = document.getElementById('back-btn');
const itemsTitle    = document.getElementById('items-category-title');
const categoryIcon  = document.getElementById('category-icon');
const comboBanner   = document.getElementById('combo-banner');
const comboDesc     = document.getElementById('combo-desc');
const comboPrice    = document.getElementById('combo-price');
const comboImg      = document.getElementById('combo-img');

/* ---- FETCH ---- */
async function loadMenu() {
  showLoading();
  try {
    const res = await fetch('menu.json');
    if (!res.ok) throw new Error('Could not load menu.json');
    menuData = await res.json();
    init();
  } catch (err) {
    categoryGrid.innerHTML = `
      <div class="loading-state" style="grid-column:1/-1">
        <p style="color:var(--red);font-weight:800;font-size:15px;">Could not load menu.</p>
        <p style="font-size:12px;color:#aaa;">Please refresh the page.</p>
      </div>`;
    console.error(err);
  }
}

function showLoading() {
  categoryGrid.innerHTML = `
    <div class="loading-state" style="grid-column:1/-1">
      <div class="loading-spinner"></div>
      <span class="loading-text">Loading…</span>
    </div>`;
}

/* ---- INIT ---- */
function init() {
  renderCategories();
  handleRoute();
  window.addEventListener('popstate', handleRoute);
}

/* ---- ROUTING ---- */
function handleRoute() {
  const params = new URLSearchParams(window.location.search);
  const catId  = params.get('category');
  if (catId && menuData) {
    const cat = menuData.categories.find(c => c.id === catId);
    if (cat) { showItemsView(cat); return; }
  }
  showCategoryView();
}

function navigateTo(catId) {
  const url = catId
    ? `${window.location.pathname}?category=${catId}`
    : window.location.pathname;
  window.history.pushState({}, '', url);
  handleRoute();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---- VIEW SWITCH ---- */
function showCategoryView() {
  itemsView.classList.remove('active');
  categoryView.classList.add('active');
}

function showItemsView(cat) {
  categoryView.classList.remove('active');
  itemsView.classList.add('active');

  // Header
  itemsTitle.textContent = cat.name;
  if (cat.image) {
    categoryIcon.src = cat.image;
    categoryIcon.alt = cat.name;
    categoryIcon.style.display = 'block';
  } else {
    categoryIcon.style.display = 'none';
  }

  // Combo offer banner
  if (cat.combo_offer) {
    comboDesc.textContent  = cat.combo_offer.description;
    comboPrice.textContent = `+${cat.combo_offer.price.toLocaleString('fr-DZ')} DA`;
    comboImg.src = cat.combo_offer.image || 'images/combo-offer.webp';
    comboImg.alt = cat.combo_offer.description;
    comboBanner.style.display = 'block';
  } else {
    comboBanner.style.display = 'none';
  }

  itemsGrid.innerHTML = '';
  requestAnimationFrame(() => renderItems(cat.items));
}

/* ---- RENDER CATEGORIES ---- */
function renderCategories() {
  if (!menuData) return;
  categoryGrid.innerHTML = '';

  const sorted = [...menuData.categories].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return  1;
    return 0;
  });

  sorted.forEach(cat => categoryGrid.appendChild(buildCategoryCard(cat)));
}

function buildCategoryCard(cat) {
  const card = document.createElement('div');
  card.className = cat.featured ? 'category-card featured' : 'category-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `Browse ${cat.name}`);

  if (cat.featured) {
    card.innerHTML = `
      <span class="featured-badge">${cat.label || 'Best for Sharing'}</span>
      <div class="card-image-wrap">
        <img class="card-img-el" src="${cat.image}" alt="${cat.name}" loading="lazy" />
      </div>
      <div class="card-text-block">
        <span class="card-name">${cat.name}</span>
        <span class="card-sub">${cat.items ? cat.items.length + ' items' : ''}</span>
      </div>
    `;
  } else {
    card.innerHTML = `
      <div class="card-image-wrap">
        <img class="card-img-el" src="${cat.image}" alt="${cat.name}" loading="lazy" />
      </div>
      <span class="card-name">${cat.name}</span>
    `;
  }

  card.addEventListener('click', () => navigateTo(cat.id));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigateTo(cat.id); }
  });
  card.addEventListener('touchstart', () => { card.style.transform = 'scale(0.96)'; }, { passive: true });
  card.addEventListener('touchend',   () => { card.style.transform = ''; },           { passive: true });

  return card;
}

/* ---- RENDER ITEMS ---- */
function renderItems(items) {
  if (!items || items.length === 0) {
    itemsGrid.innerHTML = `<p style="text-align:center;padding:40px;color:#bbb;font-weight:700;">No items yet.</p>`;
    return;
  }
  items.forEach(item => itemsGrid.appendChild(buildItemCard(item)));
}

function buildItemCard(item) {
  const card = document.createElement('div');
  const hasChoices = item.choices && Object.keys(item.choices).length > 0;
  card.className = 'item-card' + (hasChoices ? ' has-choices' : '');

  const price = typeof item.price === 'number'
    ? `${item.price.toLocaleString('fr-DZ')} DA`
    : item.price;

  // Build choices HTML
  let choicesHTML = '';
  if (hasChoices) {
    choicesHTML = '<div class="choices-row">';
    for (const [label, options] of Object.entries(item.choices)) {
      choicesHTML += `<div class="choices-label">${label}</div>`;
      options.forEach(opt => {
        choicesHTML += `<span class="choice-pill">${opt}</span>`;
      });
    }
    choicesHTML += '</div>';
  }

  card.innerHTML = `
    <div class="item-img-wrap">
      <img src="${item.image}" alt="${item.name}" loading="lazy" />
    </div>
    <div class="item-info">
      <div class="item-name">${item.name}</div>
      <div class="item-desc">${item.description}</div>
      ${choicesHTML}
    </div>
    <div class="item-right">
      <div class="item-price">${price}</div>
    </div>
  `;

  return card;
}

/* ---- BACK ---- */
backBtn.addEventListener('click', () => navigateTo(null));

/* ---- START ---- */
loadMenu();
