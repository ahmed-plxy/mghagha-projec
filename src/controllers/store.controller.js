const storeRepo = require('../repositories/store.repo');
const productRepo = require('../repositories/product.repo');
const orderRepo = require('../repositories/order.repo');
const { getRelativeUploadPath } = require('../middleware/upload');

function dashboard(req, res) {
  const products = productRepo.findAllByStore(req.store.id);
  const db = require('../config/db');
  const pendingOrderCount = db.prepare(
    "SELECT COUNT(*) AS c FROM orders WHERE store_id = ? AND order_status = 'pending'"
  ).get(req.store.id).c;
  const recentOrders = orderRepo.findOrdersByStore(req.store.id, null).slice(0, 20);
  res.render('vendor/dashboard', {
    title: 'لوحة تحكم البائع',
    store: req.store,
    productCount: products.length,
    activeProductCount: products.filter((p) => p.status === 'active').length,
    pendingOrderCount,
    recentOrders
  });
}

function showEditForm(req, res) {
  res.render('vendor/store-edit', {
    title: 'إعدادات المتجر',
    store: req.store,
    errors: null
  });
}

function update(req, res) {
  const { description, shippingFee } = req.body;
  const files = req.files || {};
  const logoFile = files.logoImage ? files.logoImage[0] : null;
  const coverFile = files.coverImage ? files.coverImage[0] : null;

  const parsedFee = parseFloat(shippingFee);
  const validFee = !isNaN(parsedFee) && parsedFee >= 0 ? parsedFee : 0;

  storeRepo.updateProfile(req.store.id, {
    description: description !== undefined ? description.trim() : undefined,
    logoImage: logoFile ? getRelativeUploadPath(logoFile) : undefined,
    coverImage: coverFile ? getRelativeUploadPath(coverFile) : undefined,
    shippingFee: validFee
  });

  req.session.flash = { type: 'success', text: 'بيانات المحل اتحدثت بنجاح.' };
  res.redirect('/vendor/store/edit');
}

module.exports = { dashboard, showEditForm, update };
