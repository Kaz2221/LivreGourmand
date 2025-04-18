// backend/controllers/front/wishlistController.js
const { ListeCadeaux, ItemListeCadeaux, Livre, Utilisateur } = require('../../models');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

// @desc    Récupérer toutes les listes de cadeaux de l'utilisateur
// @route   GET /api/front/wishlists
// @access  Private
const getWishlists = async (req, res) => {
  try {
    const clientId = req.user.id_client;

    const listes = await ListeCadeaux.findAll({
      where: { id_client: clientId },
      include: [{
        model: Livre,
        through: {
          attributes: ['quantite', 'achete', 'id_acheteur']
        },
        as: 'Livres'
      }]
    });

    const listesFormatees = listes.map(liste => ({
      ...liste.get({ plain: true }),
      livres: liste.Livres
    }));

    res.json(listesFormatees);
  } catch (error) {
    console.error('Erreur lors de la récupération des listes de cadeaux:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Créer une nouvelle liste de cadeaux
// @route   POST /api/front/wishlists
// @access  Private
const createWishlist = async (req, res) => {
  try {
    const { nom_liste, date_expiration } = req.body;
    const clientId = req.user.id_client;

    const code_acces = uuidv4().substring(0, 8).toUpperCase();

    const nouvelle_liste = await ListeCadeaux.create({
      id_client: clientId,
      nom_liste,
      code_acces,
      date_expiration: date_expiration || null
    });

    res.status(201).json({
      message: 'Liste de cadeaux créée avec succès',
      liste: nouvelle_liste
    });
  } catch (error) {
    console.error('Erreur lors de la création de la liste de cadeaux:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Récupérer une liste de cadeaux par son ID
// @route   GET /api/front/wishlists/:id
// @access  Private
const getWishlistById = async (req, res) => {
  try {
    const listeId = req.params.id;
    const clientId = req.user.id_client;

    const liste = await ListeCadeaux.findOne({
      where: { id_liste_cadeaux: listeId, id_client: clientId },
      include: [{
        model: Livre,
        through: {
          attributes: ['quantite', 'achete', 'id_acheteur']
        },
        as: 'Livres'
      }]
    });

    if (!liste) {
      return res.status(404).json({ message: 'Liste de cadeaux non trouvée' });
    }

    const items = await ItemListeCadeaux.findAll({
      where: { id_liste_cadeaux: listeId, id_acheteur: { [Op.ne]: null } },
      include: [{
        model: Utilisateur,
        as: 'acheteur',
        attributes: ['nom', 'username']
      }]
    });

    const livresEnrichis = liste.Livres.map(livre => {
      const item = items.find(i => i.id_livre === livre.id_livre);
      return {
        ...livre.get({ plain: true }),
        acheteur: item && item.acheteur ? item.acheteur : null
      };
    });

    res.json({
      ...liste.get({ plain: true }),
      livres: livresEnrichis
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste de cadeaux:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Ajouter un livre à une liste de cadeaux
// @route   POST /api/front/wishlists/:id/items
// @access  Private
const addItemToWishlist = async (req, res) => {
  try {
    const { id_livre, quantite } = req.body;
    const listeId = req.params.id;
    const clientId = req.user.id_client;

    const liste = await ListeCadeaux.findOne({
      where: { id_liste_cadeaux: listeId, id_client: clientId }
    });

    if (!liste) {
      return res.status(404).json({ message: 'Liste de cadeaux non trouvée' });
    }

    const livre = await Livre.findByPk(id_livre);
    if (!livre) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    const itemExistant = await ItemListeCadeaux.findOne({
      where: { id_liste_cadeaux: listeId, id_livre }
    });

    if (itemExistant) {
      await itemExistant.update({ quantite: itemExistant.quantite + quantite });
    } else {
      await ItemListeCadeaux.create({
        id_liste_cadeaux: listeId,
        id_livre,
        quantite,
        achete: false,
        id_acheteur: null
      });
    }

    const listeMiseAJour = await ListeCadeaux.findByPk(listeId, {
      include: [{
        model: Livre,
        through: {
          attributes: ['quantite', 'achete', 'id_acheteur']
        },
        as: 'Livres'
      }]
    });

    res.status(201).json({
      message: 'Livre ajouté à la liste de cadeaux',
      liste: {
        ...listeMiseAJour.get({ plain: true }),
        livres: listeMiseAJour.Livres
      }
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du livre à la liste de cadeaux:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// @desc    Supprimer un livre d'une liste de cadeaux
// @route   DELETE /api/front/wishlists/:id/items/:itemId
// @access  Private
const removeItemFromWishlist = async (req, res) => {
  try {
    const listeId = req.params.id;
    const livreId = req.params.itemId;
    const clientId = req.user.id_client;

    const liste = await ListeCadeaux.findOne({
      where: { id_liste_cadeaux: listeId, id_client: clientId }
    });

    if (!liste) {
      return res.status(404).json({ message: 'Liste de cadeaux non trouvée' });
    }

    const item = await ItemListeCadeaux.findOne({
      where: { id_liste_cadeaux: listeId, id_livre: livreId }
    });

    if (!item) {
      return res.status(404).json({ message: 'Livre non trouvé dans la liste de cadeaux' });
    }

    await item.destroy();

    const listeMiseAJour = await ListeCadeaux.findByPk(listeId, {
      include: [{
        model: Livre,
        through: {
          attributes: ['quantite', 'achete', 'id_acheteur']
        },
        as: 'Livres'
      }]
    });

    res.json({
      message: 'Livre supprimé de la liste de cadeaux',
      liste: {
        ...listeMiseAJour.get({ plain: true }),
        livres: listeMiseAJour.Livres
      }
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du livre de la liste de cadeaux:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Mettre à jour la quantité d'un article dans la wishlist
// @route   PUT /api/front/wishlists/:id/items/:itemId
// @access  Private
const updateWishlistItem = async (req, res) => {
  try {
    const { quantite } = req.body;
    const { id: listeId, itemId: livreId } = req.params;
    const clientId = req.user.id_client;

    const liste = await ListeCadeaux.findOne({
      where: { id_liste_cadeaux: listeId, id_client: clientId }
    });

    if (!liste) {
      return res.status(404).json({ message: 'Liste non trouvée' });
    }

    const item = await ItemListeCadeaux.findOne({
      where: { id_liste_cadeaux: listeId, id_livre: livreId }
    });

    if (!item) {
      return res.status(404).json({ message: 'Article non trouvé dans la liste' });
    }

    await item.update({ quantite });

    const listeMiseAJour = await ListeCadeaux.findByPk(listeId, {
      include: [{
        model: Livre,
        through: {
          attributes: ['quantite', 'achete', 'id_acheteur']
        },
        as: 'Livres'
      }]
    });

    res.json({
      message: 'Quantité mise à jour',
      liste: {
        ...listeMiseAJour.get({ plain: true }),
        livres: listeMiseAJour.Livres
      }
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'article:", error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  getWishlists,
  createWishlist,
  getWishlistById,
  addItemToWishlist,
  removeItemFromWishlist,
  updateWishlistItem
};
