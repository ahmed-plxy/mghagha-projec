const personalListingRepo = require('../repositories/personalListing.repo');
const categoryRepo = require('../repositories/category.repo');
const { productImageUpload, getRelativeUploadPath } = require('../middleware/upload');
const multer = require('multer');

const CATEGORY_ICONS = {
  'العربيات': '🚗', 'الموبايلات': '📱', 'أجهزة منزلية': '🏠', 'أثاث منزلي': '🛋️',
  'أدوات المطبخ': '🍳', 'الحاسوب': '💻', 'مواشي وحيوانات': '🐄',
  'المحاصيل الزراعية': '🌾', 'العقارات والأراضي': '🏡', 'قسم المهن': '🔧'
};

const uploadMiddleware = productImageUpload.array('images', 6);

function slugify(text) {
  return text
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FF\w-]/g, '')
    .toLowerCase()
    .substring(0, 60) + '-' + Date.now();
}

function showSellForm(req, res) {
  const categories = categoryRepo.findAllActive().filter(c => !c.parent_id);
  const categoriesWithEmoji = categories.map(c => ({ ...c, emoji: CATEGORY_ICONS[c.name] || '📦' }));
  res.render('customer/sell', {
    title: 'بيع حاجة',
    categories: categoriesWithEmoji,
    errors: [],
    values: {}
  });
}

function submitListing(req, res) {
  uploadMiddleware(req, res, function (uploadErr) {
    const categories = categoryRepo.findAllActive().filter(c => !c.parent_id);
    const categoriesWithEmoji = categories.map(c => ({ ...c, emoji: CATEGORY_ICONS[c.name] || '📦' }));

    const renderErrors = (errors, values = {}) => {
      res.status(422).render('customer/sell', {
        title: 'بيع حاجة',
        categories: categoriesWithEmoji,
        errors,
        values
      });
    };

    if (uploadErr instanceof multer.MulterError || uploadErr) {
      return renderErrors(['حصل خطأ في رفع الصور. تأكد من الحجم والصيغة.'], req.body);
    }

    const { name, price, description, categoryId } = req.body;
    const errors = [];
    if (!name || !name.trim()) errors.push('اكتب اسم الحاجة اللي بتبيعها');
    if (!price || isNaN(Number(price)) || Number(price) < 0) errors.push('اكتب سعر صح');
    if (errors.length) return renderErrors(errors, req.body);

    const slug = slugify(name.trim());
    const listing = personalListingRepo.create({
      userId: req.session.user.id,
      categoryId: categoryId ? Number(categoryId) : null,
      name: name.trim(),
      slug,
      description: (description || '').trim(),
      price: Number(price),
      listingAttributes: '{}'
    });

    if (req.files && req.files.length > 0) {
      req.files.forEach((file, i) => {
        const relPath = getRelativeUploadPath(file);
        personalListingRepo.addImage(listing.id, relPath, i);
      });
    }

    req.flash('success', 'تمام! إعلانك اتنشر بنجاح 🎉');
    res.redirect('/classifieds/' + listing.slug);
  });
}

function myListings(req, res) {
  const listings = personalListingRepo.findByUser(req.session.user.id);
  const listingsWithImages = listings.map(l => ({
    ...l,
    images: personalListingRepo.findImages(l.id)
  }));
  res.render('customer/my-listings', {
    title: 'إعلاناتي',
    listings: listingsWithImages
  });
}

function markSold(req, res) {
  const listing = personalListingRepo.findById(req.params.id);
  if (!listing || listing.user_id !== req.session.user.id) {
    return res.status(403).render('errors/error', { title: 'ممنوع', message: 'مش ليك حق' });
  }
  personalListingRepo.updateStatus(req.params.id, 'sold');
  req.flash('success', 'تم تعليم الإعلان كـ "متباع"');
  res.redirect('/customer/my-listings');
}

function browseClassifieds(req, res) {
  const { search, categoryId } = req.query;
  const listings = personalListingRepo.findActive({
    search: search && search.trim() ? search.trim() : null,
    categoryId: categoryId ? Number(categoryId) : null
  });
  const listingsWithImages = listings.map(l => ({
    ...l,
    images: personalListingRepo.findImages(l.id)
  }));
  const categories = categoryRepo.findAllActive().filter(c => !c.parent_id);
  res.render('public/classifieds', {
    title: 'المستعمل — بيع وشراء في مغاغة',
    listings: listingsWithImages,
    categories,
    filters: { search: search || '', categoryId: categoryId || '' }
  });
}

function classifiedDetail(req, res) {
  const listing = personalListingRepo.findBySlug(req.params.slug);
  if (!listing || listing.status === 'inactive') {
    return res.status(404).render('errors/error', { title: 'غير موجود', message: 'الإعلان ده مش موجود' });
  }
  const images = personalListingRepo.findImages(listing.id);
  res.render('public/classified-detail', {
    title: listing.name,
    listing,
    images
  });
}

module.exports = { showSellForm, submitListing, myListings, markSold, browseClassifieds, classifiedDetail };
