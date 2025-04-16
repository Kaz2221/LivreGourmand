// backend/routes/back/bookRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getBooks, 
  createBook, 
  updateBook, 
  deleteBook, 
  manageReview 
} = require('../../controllers/back/bookController');
const { protect, authorize } = require('../../middlewares/authMiddleware');
const upload = require('../../middlewares/uploadMiddleware');

// Toutes les routes sont protégées et accessibles seulement aux administrateurs et gestionnaires
router.use(protect);
router.use(authorize('administrateur', 'gestionnaire', 'editeur'));

router.get('/', getBooks);
router.post('/', upload.single('image'), createBook);
router.put('/:id', upload.single('image'), updateBook);
router.delete('/:id', deleteBook);
router.put('/reviews/:id', manageReview);

module.exports = router;