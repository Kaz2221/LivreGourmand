// backend/routes/back/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getSalesData 
} = require('../../controllers/back/dashboardController');
const { protect, authorize } = require('../../middlewares/authMiddleware');

// Toutes les routes sont protégées et accessibles seulement aux administrateurs et gestionnaires
router.use(protect);
router.use(authorize('administrateur', 'gestionnaire'));

router.get('/stats', getDashboardStats);
router.get('/sales', getSalesData);

module.exports = router;