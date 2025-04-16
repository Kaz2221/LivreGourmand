// backend/controllers/back/bookController.js
const { Livre, Avis } = require('../../models');
const fs = require('fs');
const path = require('path');

// @desc    Récupérer tous les livres (avec filtres pour l'admin)
// @route   GET /api/back/books
// @access  Private/Admin
const getBooks = async (req, res) => {
  try {
    const { 
      categorie, 
      niveau_expertise, 
      search,
      min_stock,
      max_stock,
      sort
    } = req.query;

    // Construire les conditions de filtre
    let whereCondition = {};
    
    if (categorie) {
      whereCondition.categorie = categorie;
    }
    
    if (niveau_expertise) {
      whereCondition.niveau_expertise = niveau_expertise;
    }
    
    if (search) {
      whereCondition[Op.or] = [
        { titre: { [Op.iLike]: `%${search}%` } },
        { auteur: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (min_stock !== undefined) {
      whereCondition.stock = { ...whereCondition.stock, [Op.gte]: min_stock };
    }
    
    if (max_stock !== undefined) {
      whereCondition.stock = { ...whereCondition.stock, [Op.lte]: max_stock };
    }

    // Construire les options de tri
    let order = [];
    if (sort) {
      switch (sort) {
        case 'stock_asc':
          order.push(['stock', 'ASC']);
          break;
        case 'stock_desc':
          order.push(['stock', 'DESC']);
          break;
        case 'price_asc':
          order.push(['prix', 'ASC']);
          break;
        case 'price_desc':
          order.push(['prix', 'DESC']);
          break;
        case 'title_asc':
          order.push(['titre', 'ASC']);
          break;
        case 'title_desc':
          order.push(['titre', 'DESC']);
          break;
        default:
          order.push(['date_ajout', 'DESC']);
      }
    } else {
      order.push(['date_ajout', 'DESC']);
    }

    // Récupérer les livres avec pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: livres } = await Livre.findAndCountAll({
      where: whereCondition,
      order,
      limit,
      offset
    });

    res.json({
      livres,
      page,
      pages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Créer un nouveau livre
// @route   POST /api/back/books
// @access  Private/Admin
const createBook = async (req, res) => {
  try {
    const { 
      titre, 
      auteur, 
      editeur, 
      categorie, 
      prix, 
      stock, 
      description, 
      niveau_expertise 
    } = req.body;

    // Gérer l'upload d'image si présent
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/livres/${req.file.filename}`;
    }

    const nouveauLivre = await Livre.create({
      titre,
      auteur,
      editeur,
      categorie,
      prix,
      stock,
      description,
      niveau_expertise,
      image_url
    });

    res.status(201).json({
      message: 'Livre créé avec succès',
      livre: nouveauLivre
    });
  } catch (error) {
    console.error('Erreur lors de la création du livre:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Mettre à jour un livre
// @route   PUT /api/back/books/:id
// @access  Private/Admin
const updateBook = async (req, res) => {
  try {
    const livreId = req.params.id;
    const { 
      titre, 
      auteur, 
      editeur, 
      categorie, 
      prix, 
      stock, 
      description, 
      niveau_expertise 
    } = req.body;

    const livre = await Livre.findByPk(livreId);
    if (!livre) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    // Gérer l'upload d'image si présent
    let image_url = livre.image_url;
    if (req.file) {
      // Supprimer l'ancienne image si elle existe
      if (livre.image_url) {
        const oldImagePath = path.join(__dirname, '../../..', livre.image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      image_url = `/uploads/livres/${req.file.filename}`;
    }

    await livre.update({
      titre,
      auteur,
      editeur,
      categorie,
      prix,
      stock,
      description,
      niveau_expertise,
      image_url
    });

    res.json({
      message: 'Livre mis à jour avec succès',
      livre
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du livre:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Supprimer un livre
// @route   DELETE /api/back/books/:id
// @access  Private/Admin
const deleteBook = async (req, res) => {
  try {
    const livreId = req.params.id;

    const livre = await Livre.findByPk(livreId);
    if (!livre) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    // Supprimer l'image associée si elle existe
    if (livre.image_url) {
      const imagePath = path.join(__dirname, '../../..', livre.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await livre.destroy();

    res.json({ message: 'Livre supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du livre:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Gérer les avis (valider/rejeter)
// @route   PUT /api/back/books/reviews/:id
// @access  Private/Admin
const manageReview = async (req, res) => {
  try {
    const avisId = req.params.id;
    const { valide } = req.body;

    const avis = await Avis.findByPk(avisId);
    if (!avis) {
      return res.status(404).json({ message: 'Avis non trouvé' });
    }

    await avis.update({ valide });

    res.json({
      message: `Avis ${valide ? 'validé' : 'rejeté'} avec succès`,
      avis
    });
  } catch (error) {
    console.error('Erreur lors de la gestion de l\'avis:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
  manageReview
};