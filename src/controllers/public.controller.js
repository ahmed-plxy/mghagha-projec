const storeRepo = require('../repositories/store.repo');
const productRepo = require('../repositories/product.repo');
const productImageRepo = require('../repositories/productImage.repo');
const categoryRepo = require('../repositories/category.repo');
const areaRepo = require('../repositories/area.repo');
const reviewRepo = require('../repositories/review.repo');
const wishlistRepo = require('../repositories/wishlist.repo');
const personalListingRepo = require('../repositories/personalListing.repo');
const bannerRepo = require('../repositories/banner.repo');

const CATEGORY_ICONS = {
  'العربيات': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 17H3a1 1 0 01-1-1v-4a1 1 0 01.08-.38l2-5A1 1 0 015 6h14a1 1 0 01.93.62l2 5A1 1 0 0122 12v4a1 1 0 01-1 1h-2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/>
    <circle cx="16.5" cy="17.5" r="2.5"/>
    <path d="M10 17h4"/>
    <path d="M2 12h20"/>
    <path d="M5 6l-1 4"/><path d="M19 6l1 4"/>
  </svg>`,
  'الموبايلات': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="3"/>
    <circle cx="12" cy="18" r="1" fill="currentColor"/>
    <line x1="9" y1="6" x2="15" y2="6" stroke-width="2" stroke-linecap="round"/>
    <rect x="8" y="9" width="8" height="6" rx="1" opacity=".4" fill="currentColor" stroke="none"/>
  </svg>`,
  'أجهزة منزلية': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1"/>
    <rect x="14" y="3" width="7" height="5" rx="1"/>
    <rect x="14" y="12" width="7" height="9" rx="1"/>
    <rect x="3" y="16" width="7" height="5" rx="1"/>
    <circle cx="6.5" cy="8" r="1" fill="currentColor" stroke="none"/>
    <path d="M17 6h1"/>
  </svg>`,
  'أثاث منزلي': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="8" width="20" height="10" rx="2"/>
    <path d="M6 8V6a1 1 0 011-1h10a1 1 0 011 1v2"/>
    <line x1="6" y1="18" x2="6" y2="21"/>
    <line x1="18" y1="18" x2="18" y2="21"/>
    <path d="M2 13h20"/>
    <path d="M6 11h3"/><path d="M15 11h3"/>
  </svg>`,
  'أدوات المطبخ': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2a4 4 0 014 4v1H8V6a4 4 0 014-4z"/>
    <path d="M8 7v10a2 2 0 004 0V7"/>
    <line x1="20" y1="2" x2="20" y2="9"/>
    <path d="M17 5h6"/>
    <line x1="20" y1="9" x2="20" y2="22"/>
  </svg>`,
  'الحاسوب': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
    <rect x="5" y="6" width="14" height="8" rx="1" opacity=".3" fill="currentColor" stroke="none"/>
    <path d="M8 10h8" opacity=".6"/>
  </svg>`,
  'مواشي وحيوانات': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="12" cy="12" rx="5" ry="4"/>
    <path d="M7 12c-2 0-4 1-4 3v2h2v-1"/><path d="M17 12c2 0 4 1 4 3v2h-2v-1"/>
    <path d="M8 8c-1-2-1-4 1-5"/><path d="M16 8c1-2 1-4-1-5"/>
    <circle cx="10" cy="12" r=".5" fill="currentColor" stroke="none"/>
    <circle cx="14" cy="12" r=".5" fill="currentColor" stroke="none"/>
    <path d="M10 15c.6.7 3.4.7 4 0"/>
  </svg>`,
  'المحاصيل الزراعية': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 22V12"/>
    <path d="M12 12C12 7 7 3 3 3c0 5 3 9 9 9z"/>
    <path d="M12 12c0-5 5-9 9-9-1 5-4 9-9 9z"/>
    <path d="M5 21h14"/>
  </svg>`,
  'العقارات والأراضي': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 9.5L12 3l9 6.5V21H3V9.5z"/>
    <path d="M9 21V13h6v8"/>
    <rect x="10" y="7" width="4" height="3" rx=".5" opacity=".4" fill="currentColor" stroke="none"/>
  </svg>`,
  'قسم المهن': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14.7 6.3a1 1 0 010 1.4l-8 8a1 1 0 01-.4.25l-3 1a1 1 0 01-1.25-1.25l1-3a1 1 0 01.25-.4l8-8a1 1 0 011.4 0z"/>
    <path d="M13 8l3 3"/>
    <path d="M16 2a3 3 0 013 3" opacity=".5"/>
    <path d="M19 5l-2 2"/>
  </svg>`
};

function getIcon(name) {
  return CATEGORY_ICONS[name] || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/></svg>';
}

function landing(req, res) {
  const mainCategories = categoryRepo.findAllActive().filter(c => !c.parent_id).map(c => ({
    ...c,
    icon: getIcon(c.name)
  }));

  const featuredStores = storeRepo.findAllActive({}).slice(0, 6);

  const productsByCategory = {};
  mainCategories.forEach(cat => {
    const catProducts = productRepo.findPublicProducts({ categoryId: cat.id, limit: 8 });
    if (catProducts.length > 0) {
      productsByCategory[cat.id] = { category: cat, products: catProducts };
    }
  });

  const recentListings = personalListingRepo.findActive({ limit: 4 });
  const recentClassifieds = recentListings.map(l => ({
    ...l,
    images: personalListingRepo.findImages(l.id)
  }));

  let activeBanners = [];
  try { activeBanners = bannerRepo.findActive(); } catch (e) {}

  res.render('public/landing', {
    title: 'الرئيسية',
    featuredStores,
    mainCategories,
    productsByCategory,
    recentClassifieds,
    activeBanners
  });
}

function listStores(req, res) {
  const { search, areaId } = req.query;
  const stores = storeRepo.findAllActive({
    search: search && search.trim() !== '' ? search.trim() : null,
    areaId: areaId ? Number(areaId) : null
  });
  const areas = areaRepo.findAllActive();
  res.render('public/stores', {
    title: 'المتاجر',
    stores,
    areas,
    filters: { search: search || '', areaId: areaId || '' }
  });
}

function storeProfile(req, res) {
  const store = storeRepo.findActiveBySlug(req.params.storeSlug);
  if (!store) {
    return res.status(404).render('errors/error', { title: 'غير موجود', message: 'المتجر غير موجود.' });
  }
  const products = productRepo.findActiveByStore(store.id);
  res.render('public/store-profile', { title: store.store_name, store, products });
}

const LOCAL_DISCOVERY_SECTIONS = [
  { key: 'cars',         title: 'سيارات مستعملة في مغاغة',   emoji: '🚗', categoryName: 'العربيات' },
  { key: 'appliances',   title: 'أجهزة منزلية مستعملة',       emoji: '❄️', categoryName: 'أجهزة منزلية' },
  { key: 'livestock',   title: 'مواشي وحيوانات',              emoji: '🐄', categoryName: 'مواشي وحيوانات' },
  { key: 'agriculture', title: 'المحاصيل الزراعية',            emoji: '🌾', categoryName: 'المحاصيل الزراعية' },
];

function listProducts(req, res) {
  const { search, categoryId, subCategoryId, areaId, minPrice, maxPrice } = req.query;
  const hasFilters = (search && search.trim()) || categoryId || subCategoryId || areaId || minPrice || maxPrice;

  const effectiveCategoryId = subCategoryId ? Number(subCategoryId) : (categoryId ? Number(categoryId) : null);

  const products = productRepo.findPublicProducts({
    search: search && search.trim() !== '' ? search.trim() : null,
    categoryId: subCategoryId ? null : (categoryId ? Number(categoryId) : null),
    subCategoryId: subCategoryId ? Number(subCategoryId) : null,
    areaId: areaId ? Number(areaId) : null,
    minPrice: minPrice !== undefined && minPrice !== '' ? Number(minPrice) : null,
    maxPrice: maxPrice !== undefined && maxPrice !== '' ? Number(maxPrice) : null
  });

  const allCategories = categoryRepo.findAllActive();
  const mainCategories = allCategories.filter(c => !c.parent_id).map(c => ({
    ...c,
    icon: getIcon(c.name)
  }));
  const areas = areaRepo.findAllActive();

  let subCategories = [];
  if (categoryId) {
    subCategories = categoryRepo.findByParent(Number(categoryId));
  }

  let localSections = [];
  if (!hasFilters) {
    const allProducts = productRepo.findPublicProducts({});
    localSections = LOCAL_DISCOVERY_SECTIONS.map(sec => {
      const cat = allCategories.find(c => c.name === sec.categoryName);
      const sectionProducts = cat
        ? allProducts.filter(p => p.category_id === cat.id).slice(0, 8)
        : [];
      return { ...sec, categoryId: cat ? cat.id : null, products: sectionProducts };
    }).filter(s => s.products.length > 0);
  }

  res.render('public/products', {
    title: 'المنتجات',
    products,
    mainCategories,
    categories: allCategories,
    subCategories,
    areas,
    localSections,
    hasFilters: !!hasFilters,
    filters: {
      search: search || '',
      categoryId: categoryId || '',
      subCategoryId: subCategoryId || '',
      areaId: areaId || '',
      minPrice: minPrice || '',
      maxPrice: maxPrice || ''
    }
  });
}

function productDetail(req, res) {
  const { storeSlug, productSlug } = req.params;
  const product = productRepo.findPublicByStoreSlugAndProductSlug(storeSlug, productSlug);
  if (!product) {
    return res.status(404).render('errors/error', { title: 'غير موجود', message: 'المنتج غير موجود.' });
  }
  const images = productImageRepo.findByProduct(product.id);
  const reviews = reviewRepo.findApprovedByProduct(product.id);
  const isWishlisted = req.session.user && req.session.user.role === 'customer'
    ? wishlistRepo.isInWishlist(req.session.user.id, product.id)
    : false;

  let category = null;
  let parentCategory = null;
  let isMobileCategory = false;
  if (product.category_id) {
    category = categoryRepo.findById ? categoryRepo.findById(product.category_id) : null;
    if (!category) {
      try {
        const db = require('../config/db');
        category = db.prepare('SELECT * FROM categories WHERE id = ?').get(product.category_id);
      } catch (e) {}
    }
    if (category && category.parent_id) {
      try {
        const db = require('../config/db');
        parentCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(category.parent_id);
      } catch (e) {}
    }
    const catSlug = (parentCategory || category || {}).slug || '';
    isMobileCategory = catSlug === 'mobiles' || catSlug === 'mobile-phones';
  }

  let parsedAttributes = {};
  if (product.product_attributes) {
    try { parsedAttributes = JSON.parse(product.product_attributes); } catch (e) {}
  }

  let relatedProducts = [];
  try {
    relatedProducts = productRepo.findPublicProducts({
      categoryId: product.category_id || undefined,
      limit: 7
    }).filter(p => p.id !== product.id).slice(0, 6);
  } catch (e) {}

  res.render('public/product-detail', {
    title: product.name,
    product,
    images,
    reviews,
    isWishlisted,
    isMobileCategory,
    parsedAttributes,
    relatedProducts,
    category,
    parentCategory
  });
}

function aboutPage(req, res) {
  res.render('public/about', { title: 'من نحن' });
}

function faqPage(req, res) {
  res.render('public/faq', { title: 'الأسئلة الشائعة' });
}

function helpPage(req, res) {
  res.render('public/help', { title: 'المساعدة والدعم' });
}

function privacyPage(req, res) {
  res.render('public/privacy', { title: 'سياسة الخصوصية' });
}

function termsPage(req, res) {
  res.render('public/terms', { title: 'اتفاقية البيع والشراء وسياسة الخصوصية' });
}

module.exports = { landing, listStores, storeProfile, listProducts, productDetail, aboutPage, faqPage, helpPage, privacyPage, termsPage };
