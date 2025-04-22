// backend/routes/back/orderRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getOrders, 
  getOrderById, 
  updateOrderStatus 
} = require('../../controllers/back/orderController');
const { protect, authorize } = require('../../middlewares/authMiddleware');

// Toutes les routes sont protégées et accessibles seulement aux administrateurs et gestionnaires
router.use(protect);
router.use(authorize('administrateur', 'gestionnaire'));

// Utilisez des chemins différents pour les différentes fonctionnalités
router.get('/', getOrders); // Récupérer toutes les commandes (pour l'admin)
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);

module.exports = router;