// backend/routes/back/bookRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middlewares/authMiddleware');

// Normalement, ces fonctions seraient importées du contrôleur correspondant
// Nous allons les définir temporairement ici en attendant que vous créiez le contrôleur
const getBooks = (req, res) => {
  res.json({ message: 'Liste des livres (administration)' });
};

const getBookById = (req, res) => {
  res.json({ message: `Détails du livre ${req.params.id} (administration)` });
};

const createBook = (req, res) => {
  res.status(201).json({
    message: 'Livre créé avec succès',
    book: req.body
  });
};

const updateBook = (req, res) => {
  res.json({
    message: `Livre ${req.params.id} mis à jour avec succès`,
    book: req.body
  });
};

const deleteBook = (req, res) => {
  res.json({ message: `Livre ${req.params.id} supprimé avec succès` });
};

const manageReview = (req, res) => {
  res.json({
    message: `Avis ${req.params.id} ${req.body.valide ? 'validé' : 'rejeté'} avec succès`
  });
};

// Toutes les routes sont protégées et accessibles seulement aux administrateurs et gestionnaires
router.use(protect);
router.use(authorize('administrateur', 'gestionnaire', 'editeur'));

// Routes
router.route('/')
  .get(getBooks)
  .post(createBook);

router.route('/:id')
  .get(getBookById)
  .put(updateBook)
  .delete(deleteBook);

router.put('/reviews/:id', manageReview);

module.exports = router;