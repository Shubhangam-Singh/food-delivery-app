const express = require('express');
const orderController = require('../controllers/orderController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Customer routes
router.post('/', orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);

// Restaurant owner/admin routes
router.patch('/:id/status', authorize('RESTAURANT_OWNER', 'ADMIN'), orderController.updateOrderStatus);

module.exports = router;
