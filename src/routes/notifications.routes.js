const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const notificationController = require('../controllers/notification.controller');

router.use(requireAuth);
router.get('/', notificationController.list);
router.post('/:id/read', notificationController.markRead);

module.exports = router;
