// backend/routes/front/wishlistRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getWishlists, 
  createWishlist, 
  getWishlistById, 
  addItemToWishlist, 
  removeItemFromWishlist,
  accessWishlistByCode,
  purchaseWishlistItem
} = require('../../controllers/front/wishListController');
const { protect } = require('../../middlewares/authMiddleware');

// Routes publiques
router.get('/access/:code', accessWishlistByCode);

// Routes protégées
router.use(protect);
router.get('/', getWishlists);
router.post('/', createWishlist);
router.get('/:id', getWishlistById);
router.post('/:id/items', addItemToWishlist);
router.delete('/:id/items/:itemId', removeItemFromWishlist);
router.put('/access/:code/items/:itemId/purchase', purchaseWishlistItem);

module.exports = router;