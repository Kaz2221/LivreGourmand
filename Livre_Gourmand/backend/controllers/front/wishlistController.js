// backend/controllers/front/wishlistController.js
const { ListeCadeaux, ItemListeCadeaux, Livre, Utilisateur } = require('../../models');
const { v4: uuidv4 } = require('uuid');

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
        as: 'livres'
      }]
    });

    res.json(listes);
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

    // Générer un code d'accès unique
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
      where: { 
        id_liste_cadeaux: listeId,
        id_client: clientId 
      },
      include: [{
        model: Livre,
        through: {
          attributes: ['quantite', 'achete', 'id_acheteur']
        },
        as: 'livres'
      }]
    });

    if (!liste) {
      return res.status(404).json({ message: 'Liste de cadeaux non trouvée' });
    }

    // Récupérer les informations des acheteurs
    const items = await ItemListeCadeaux.findAll({
      where: { id_liste_cadeaux: listeId, id_acheteur: { [Op.ne]: null } },
      include: [{
        model: Utilisateur,
        as: 'acheteur',
        attributes: ['nom', 'username']
      }]
    });

    // Enrichir la liste avec les informations des acheteurs
    const livresEnrichis = liste.livres.map(livre => {
      const item = items.find(i => i.id_livre === livre.id_livre);
      return {
        ...livre.get({ plain: true }),
        acheteur: item && item.acheteur ? item.acheteur : null
      };
    });

    const listeAvecAcheteurs = {
      ...liste.get({ plain: true }),
      livres: livresEnrichis
    };

    res.json(listeAvecAcheteurs);
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

    // Vérifier si la liste existe et appartient à l'utilisateur
    const liste = await ListeCadeaux.findOne({
      where: { 
        id_liste_cadeaux: listeId,
        id_client: clientId 
      }
    });

    if (!liste) {
      return res.status(404).json({ message: 'Liste de cadeaux non trouvée' });
    }

    // Vérifier si le livre existe
    const livre = await Livre.findByPk(id_livre);
    if (!livre) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    // Vérifier si le livre est déjà dans la liste
    const itemExistant = await ItemListeCadeaux.findOne({
      where: {
        id_liste_cadeaux: listeId,
        id_livre
      }
    });

    if (itemExistant) {
      // Mettre à jour la quantité
      await itemExistant.update({
        quantite: itemExistant.quantite + quantite
      });
    } else {
      // Ajouter le livre à la liste
      await ItemListeCadeaux.create({
        id_liste_cadeaux: listeId,
        id_livre,
        quantite,
        achete: false,
        id_acheteur: null
      });
    }

    // Récupérer la liste mise à jour
    const listeMiseAJour = await ListeCadeaux.findByPk(listeId, {
      include: [{
        model: Livre,
        through: {
          attributes: ['quantite', 'achete', 'id_acheteur']
        },
        as: 'livres'
      }]
    });

    res.status(201).json({
      message: 'Livre ajouté à la liste de cadeaux',
      liste: listeMiseAJour
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du livre à la liste de cadeaux:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
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

    // Vérifier si la liste existe et appartient à l'utilisateur
    const liste = await ListeCadeaux.findOne({
      where: { 
        id_liste_cadeaux: listeId,
        id_client: clientId 
      }
    });

    if (!liste) {
      return res.status(404).json({ message: 'Liste de cadeaux non trouvée' });
    }

    // Vérifier si le livre est dans la liste
    const item = await ItemListeCadeaux.findOne({
      where: {
        id_liste_cadeaux: listeId,
        id_livre: livreId
      }
    });

    if (!item) {
      return res.status(404).json({ message: 'Livre non trouvé dans la liste de cadeaux' });
    }

    // Supprimer le livre de la liste
    await item.destroy();

    // Récupérer la liste mise à jour
    const listeMiseAJour = await ListeCadeaux.findByPk(listeId, {
      include: [{
        model: Livre,
        through: {
          attributes: ['quantite', 'achete', 'id_acheteur']
        },
        as: 'livres'
      }]
    });

    res.json({
      message: 'Livre supprimé de la liste de cadeaux',
      liste: listeMiseAJour
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du livre de la liste de cadeaux:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Accéder à une liste de cadeaux avec un code
// @route   GET /api/front/wishlists/access/:code
// @access  Public
const accessWishlistByCode = async (req, res) => {
  try {
    const code = req.params.code;

    const liste = await ListeCadeaux.findOne({
      where: { code_acces: code },
      include: [{
        model: Livre,
        through: {
          attributes: ['quantite', 'achete', 'id_acheteur']
        },
        as: 'livres'
      }, {
        model: Utilisateur,
        attributes: ['nom', 'username'],
        as: 'proprietaire'
      }]
    });

    if (!liste) {
      return res.status(404).json({ message: 'Liste de cadeaux non trouvée' });
    }

    // Vérifier si la liste a expiré
    if (liste.date_expiration && new Date(liste.date_expiration) < new Date()) {
      return res.status(400).json({ message: 'Cette liste de cadeaux a expiré' });
    }

    res.json(liste);
  } catch (error) {
    console.error('Erreur lors de l\'accès à la liste de cadeaux:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Acheter un livre d'une liste de cadeaux
// @route   PUT /api/front/wishlists/access/:code/items/:itemId/purchase
// @access  Private
const purchaseWishlistItem = async (req, res) => {
  try {
    const code = req.params.code;
    const livreId = req.params.itemId;
    const userId = req.user.id_utilisateur;

    // Vérifier si la liste existe
    const liste = await ListeCadeaux.findOne({
      where: { code_acces: code }
    });

    if (!liste) {
      return res.status(404).json({ message: 'Liste de cadeaux non trouvée' });
    }

    // Vérifier si la liste a expiré
    if (liste.date_expiration && new Date(liste.date_expiration) < new Date()) {
      return res.status(400).json({ message: 'Cette liste de cadeaux a expiré' });
    }

    // Vérifier si le livre est dans la liste
    const item = await ItemListeCadeaux.findOne({
      where: {
        id_liste_cadeaux: liste.id_liste_cadeaux,
        id_livre: livreId
      }
    });

    if (!item) {
      return res.status(404).json({ message: 'Livre non trouvé dans la liste de cadeaux' });
    }

    // Vérifier si le livre a déjà été acheté
    if (item.achete) {
      return res.status(400).json({ message: 'Ce livre a déjà été acheté' });
    }

    // Marquer le livre comme acheté
    await item.update({
      achete: true,
      id_acheteur: userId
    });

    res.json({
      message: 'Livre marqué comme acheté',
      item: {
        ...item.get({ plain: true }),
        acheteur: req.user.nom
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'achat du livre:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  getWishlists,
  createWishlist,
  getWishlistById,
  addItemToWishlist,
  removeItemFromWishlist,
  accessWishlistByCode,
  purchaseWishlistItem
};