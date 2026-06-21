const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');
const personalListingController = require('../controllers/personalListing.controller');

router.get('/', publicController.landing);
router.get('/stores', publicController.listStores);
router.get('/stores/:storeSlug', publicController.storeProfile);
router.get('/products', publicController.listProducts);
router.get('/stores/:storeSlug/products/:productSlug', publicController.productDetail);
router.get('/about', publicController.aboutPage);
router.get('/faq', publicController.faqPage);
router.get('/help', publicController.helpPage);
router.get('/privacy', publicController.privacyPage);
router.get('/terms', publicController.termsPage);

router.get('/classifieds', personalListingController.browseClassifieds);
router.get('/classifieds/:slug', personalListingController.classifiedDetail);

module.exports = router;
