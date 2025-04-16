// backend/controllers/front/cartController.js
const { Panier, ItemPanier, Livre } = require('../../models');

// @desc    Récupérer le panier de l'utilisateur
// @route   GET /api/front/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const clientId = req.user.id_client;

    // Récupérer le panier ou le créer s'il n'existe pas
    let panier = await Panier.findOne({
      where: { id_client: clientId },
      include: [{
        model: Livre,
        through: {
          attributes: ['quantite', 'prix_unitaire']
        }
      }]
    });

    if (!panier) {
      panier = await Panier.create({
        id_client: clientId,
        prix_total: 0
      });
      panier.Livres = [];
    }

    res.json(panier);
  } catch (error) {
    console.error('Erreur lors de la récupération du panier:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Ajouter un livre au panier
// @route   POST /api/front/cart/items
// @access  Private
const addItemToCart = async (req, res) => {
  try {
    const { id_livre, quantite } = req.body;
    const clientId = req.user.id_client;

    // Vérifier si le livre existe
    const livre = await Livre.findByPk(id_livre);
    if (!livre) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    // Vérifier le stock
    if (livre.stock < quantite) {
      return res.status(400).json({ message: 'Stock insuffisant' });
    }

    // Récupérer ou créer le panier
    let panier = await Panier.findOne({ where: { id_client: clientId } });
    if (!panier) {
      panier = await Panier.create({
        id_client: clientId,
        prix_total: 0
      });
    }

    // Vérifier si l'article est déjà dans le panier
    const itemExistant = await ItemPanier.findOne({
      where: {
        id_panier: panier.id_panier,
        id_livre
      }
    });

    if (itemExistant) {
      // Mettre à jour la quantité
      await itemExistant.update({
        quantite: itemExistant.quantite + quantite
      });
    } else {
      // Ajouter le nouvel article
      await ItemPanier.create({
        id_panier: panier.id_panier,
        id_livre,
        quantite,
        prix_unitaire: livre.prix
      });
    }

    // Récupérer le panier mis à jour
    const panierMisAJour = await Panier.findByPk(panier.id_panier, {
      include: [{
        model: Livre,
        through: {
          attributes: ['quantite', 'prix_unitaire']
        }
      }]
    });

    res.status(201).json({
      message: 'Article ajouté au panier',
      panier: panierMisAJour
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout au panier:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Mettre à jour la quantité d'un article dans le panier
// @route   PUT /api/front/cart/items/:id
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { quantite } = req.body;
    const livreId = req.params.id;
    const clientId = req.user.id_client;

    // Vérifier si le livre existe
    const livre = await Livre.findByPk(livreId);
    if (!livre) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    // Vérifier le stock
    if (livre.stock < quantite) {
      return res.status(400).json({ message: 'Stock insuffisant' });
    }

    // Récupérer le panier
    const panier = await Panier.findOne({ where: { id_client: clientId } });
    if (!panier) {
      return res.status(404).json({ message: 'Panier non trouvé' });
    }

    // Vérifier si l'article est dans le panier
    const item = await ItemPanier.findOne({
      where: {
        id_panier: panier.id_panier,
        id_livre: livreId
      }
    });

    if (!item) {
      return res.status(404).json({ message: 'Article non trouvé dans le panier' });
    }

    // Mettre à jour la quantité
    if (quantite <= 0) {
      // Supprimer l'article si la quantité est 0 ou moins
      await item.destroy();
    } else {
      await item.update({ quantite });
    }

    // Récupérer le panier mis à jour
    const panierMisAJour = await Panier.findByPk(panier.id_panier, {
      include: [{
        model: Livre,
        through: {
          attributes: ['quantite', 'prix_unitaire']
        }
      }]
    });

    res.json({
      message: 'Panier mis à jour',
      panier: panierMisAJour
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du panier:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Supprimer un article du panier
// @route   DELETE /api/front/cart/items/:id
// @access  Private
const removeCartItem = async (req, res) => {
  try {
    const livreId = req.params.id;
    const clientId = req.user.id_client;

    // Récupérer le panier
    const panier = await Panier.findOne({ where: { id_client: clientId } });
    if (!panier) {
      return res.status(404).json({ message: 'Panier non trouvé' });
    }

    // Vérifier si l'article est dans le panier
    const item = await ItemPanier.findOne({
      where: {
        id_panier: panier.id_panier,
        id_livre: livreId
      }
    });

    if (!item) {
      return res.status(404).json({ message: 'Article non trouvé dans le panier' });
    }

    // Supprimer l'article
    await item.destroy();

    // Récupérer le panier mis à jour
    const panierMisAJour = await Panier.findByPk(panier.id_panier, {
      include: [{
        model: Livre,
        through: {
          attributes: ['quantite', 'prix_unitaire']
        }
      }]
    });

    res.json({
      message: 'Article supprimé du panier',
      panier: panierMisAJour
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'article:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Vider le panier
// @route   DELETE /api/front/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const clientId = req.user.id_client;

    // Récupérer le panier
    const panier = await Panier.findOne({ where: { id_client: clientId } });
    if (!panier) {
      return res.status(404).json({ message: 'Panier non trouvé' });
    }

    // Supprimer tous les articles
    await ItemPanier.destroy({
      where: { id_panier: panier.id_panier }
    });

    // Mettre à jour le prix total
    await panier.update({ prix_total: 0 });

    res.json({
      message: 'Panier vidé',
      panier: {
        ...panier.get({ plain: true }),
        Livres: []
      }
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du panier:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};