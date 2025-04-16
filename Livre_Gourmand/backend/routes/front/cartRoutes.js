// backend/routes/front/cartRoutes.js
const express = require('express');
const router = express.Router();
const { getCart, addItemToCart, updateCartItem, removeCartItem, clearCart } = require('../../controllers/front/cartController');
const { protect } = require('../../middlewares/authMiddleware');

// Toutes les routes de panier sont protégées
router.use(protect);

router.get('/', getCart);
router.post('/items', addItemToCart);
router.put('/items/:id', updateCartItem);
router.delete('/items/:id', removeCartItem);
router.delete('/', clearCart);

module.exports = router;