const { Panier, ItemPanier, Livre } = require('../../models');

// @desc    Récupérer le panier de l'utilisateur
// @route   GET /api/front/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const clientId = req.user.id_client;
    console.log("🔥 getCart a été appelé !");
    const panier = await Panier.findOne({
      where: { id_client: clientId },
      include: [{
        model: Livre,
        as: 'Livres',
        through: {
          model: ItemPanier,
          attributes: ['quantite', 'prix_unitaire']
        }
      }]
    });

    if (!panier) {
      return res.status(404).json({ message: "Panier introuvable" });
    }

    res.json(panier);
  } catch (error) {
    console.error('Erreur lors de la récupération du panier:', error);
    res.status(500).json({ message: 'Erreur serveur' });
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

    // Vérifier le stock disponible
    if (livre.stock < quantite) {
      return res.status(400).json({ message: `Stock insuffisant. Il reste ${livre.stock} exemplaire(s).` });
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
      const nouvelleQuantite = itemExistant.quantite + quantite;

      // Vérifier que la somme n'excède pas le stock
      if (livre.stock < quantite) {
        return res.status(400).json({ message: `Stock insuffisant. Il reste ${livre.stock} exemplaire(s).` });
      }

      await itemExistant.update({
        quantite: nouvelleQuantite
      });

      // Mettre à jour le stock
      livre.stock -= quantite;
      await livre.save();
    } else {
      // Ajouter le nouvel article
      await ItemPanier.create({
        id_panier: panier.id_panier,
        id_livre,
        quantite,
        prix_unitaire: livre.prix
      });

      // Mettre à jour le stock
      livre.stock -= quantite;
      await livre.save();
    }

    // Récupérer le panier mis à jour
    const panierMisAJour = await Panier.findByPk(panier.id_panier, {
      include: [{
        model: Livre,
        as: 'Livres',
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

    // Récupérer le livre
    const livre = await Livre.findByPk(livreId);
    if (!livre) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    // Récupérer le panier
    const panier = await Panier.findOne({ where: { id_client: clientId } });
    if (!panier) {
      return res.status(404).json({ message: 'Panier non trouvé' });
    }

    // Récupérer l'article dans le panier
    const item = await ItemPanier.findOne({
      where: {
        id_panier: panier.id_panier,
        id_livre: livreId
      }
    });

    if (!item) {
      return res.status(404).json({ message: 'Article non trouvé dans le panier' });
    }

    const difference = quantite - item.quantite;

    if (difference > 0) {
      // On veut augmenter la quantité → vérifier le stock
      if (livre.stock < difference) {
        return res.status(400).json({ message: `Stock insuffisant. Il reste ${livre.stock} exemplaire(s).` });
      }

      livre.stock -= difference;
    } else if (difference < 0) {
      // On diminue la quantité → on remet des stocks
      livre.stock += Math.abs(difference);
    }

    await livre.save();

    if (quantite <= 0) {
      await item.destroy();
    } else {
      await item.update({ quantite });
    }

    const panierMisAJour = await Panier.findByPk(panier.id_panier, {
      include: [{
        model: Livre,
        as: 'Livres',
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

    const panier = await Panier.findOne({ where: { id_client: clientId } });
    if (!panier) return res.status(404).json({ message: 'Panier non trouvé' });

    const item = await ItemPanier.findOne({
      where: {
        id_panier: panier.id_panier,
        id_livre: livreId
      }
    });

    if (!item) return res.status(404).json({ message: 'Article non trouvé dans le panier' });

    // Remettre le stock
    const livre = await Livre.findByPk(livreId);
    if (livre) {
      livre.stock += item.quantite;
      await livre.save();
    }

    await item.destroy();

    const panierMisAJour = await Panier.findByPk(panier.id_panier, {
      include: [{
        model: Livre,
        as: 'Livres',
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

    const panier = await Panier.findOne({ where: { id_client: clientId } });
    if (!panier) return res.status(404).json({ message: 'Panier non trouvé' });

    const items = await ItemPanier.findAll({ where: { id_panier: panier.id_panier } });

    // Pour chaque item, remettre le stock
    for (const item of items) {
      const livre = await Livre.findByPk(item.id_livre);
      if (livre) {
        livre.stock += item.quantite;
        await livre.save();
      }
    }

    await ItemPanier.destroy({ where: { id_panier: panier.id_panier } });
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
