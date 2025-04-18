// backend/routes/front/wishlistRoutes.js
const express = require('express');
const router = express.Router();
const {
  getWishlists,
  createWishlist,
  getWishlistById,
  addItemToWishlist,
  removeItemFromWishlist,
  updateWishlistItem
} = require('../../controllers/front/wishlistController'); // ✅ attention au nom du fichier, pas "wishListController"
const { protect } = require('../../middlewares/authMiddleware');

// Routes protégées (requièrent un token)
router.use(protect);

router.get('/', getWishlists);
router.post('/', createWishlist);
router.get('/:id', getWishlistById);
router.put('/:id/items/:itemId', updateWishlistItem);
router.post('/:id/items', addItemToWishlist);
router.delete('/:id/items/:itemId', removeItemFromWishlist);

module.exports = router;
