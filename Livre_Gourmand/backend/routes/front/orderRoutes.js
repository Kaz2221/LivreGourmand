// backend/routes/front/orderRoutes.js
const express = require('express');
const router = express.Router();
const { createOrder } = require('../../controllers/front/orderController');
const { protect, authorize } = require('../../middlewares/authMiddleware');

// Routes protégées
router.post('/', protect, authorize('client'), createOrder);

module.exports = router;