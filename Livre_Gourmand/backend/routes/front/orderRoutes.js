// backend/routes/front/orderRoutes.js
const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, getOrderById, cancelOrder } = require('../../controllers/front/orderController');
const { protect, authorize } = require('../../middlewares/authMiddleware');

// Routes protégées
router.post('/', protect, authorize('client'), createOrder);
router.get('/', protect, getUserOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;