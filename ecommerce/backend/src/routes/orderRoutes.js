const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, optionalAuth, restrictTo } = require('../middleware/auth');

router.post('/', optionalAuth, orderController.createOrder);
router.get('/my-orders', protect, orderController.getMyOrders);
router.get('/:id', optionalAuth, orderController.getOrder);
router.patch('/:id/cancel', optionalAuth, orderController.cancelOrder);

// Admin
router.get('/', protect, restrictTo('admin'), orderController.getAllOrders);
router.patch('/:id/status', protect, restrictTo('admin', 'moderator'), orderController.updateOrderStatus);

module.exports = router;
