// backend/routes/front/bookRoutes.js
const express = require('express');
const router = express.Router();
const { getBooks, getBookById, createBookReview } = require('../../controllers/front/bookController');
const { protect } = require('../../middlewares/authMiddleware');

// Routes publiques (pas besoin d'authentification)
router.get('/', getBooks);
router.get('/:id', getBookById);

// Routes protégées (nécessitant une authentification)
router.post('/:id/reviews', protect, createBookReview);

module.exports = router;