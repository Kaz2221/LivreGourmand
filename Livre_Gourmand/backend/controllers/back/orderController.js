// backend/controllers/back/orderController.js
const { Commande, ItemCommande, Utilisateur, Client, Livre, Paiement } = require('../../models');
const { Op } = require('sequelize');
const sequelize = require('../../config/DatabaseSingleton').getSequelize();

// @desc    Récupérer toutes les commandes (pour l'admin)
// @route   GET /api/back/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const { 
      status, 
      date_from, 
      date_to, 
      search,
      sort 
    } = req.query;

    // Construire les conditions de filtre
    let whereCondition = {};
    
    if (status) {
      whereCondition.statut = status;
    }
    
    // Filtrer par date
    if (date_from || date_to) {
      whereCondition.date_commande = {};
      
      if (date_from) {
        whereCondition.date_commande[Op.gte] = new Date(date_from);
      }
      
      if (date_to) {
        whereCondition.date_commande[Op.lte] = new Date(date_to);
      }
    }
    
    // Récupérer les commandes avec pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Options de tri
    let order = [];
    if (sort) {
      switch (sort) {
        case 'date_asc':
          order.push(['date_commande', 'ASC']);
          break;
        case 'date_desc':
          order.push(['date_commande', 'DESC']);
          break;
        case 'amount_asc':
          order.push(['montant_total', 'ASC']);
          break;
        case 'amount_desc':
          order.push(['montant_total', 'DESC']);
          break;
        default:
          order.push(['date_commande', 'DESC']);
      }
    } else {
      order.push(['date_commande', 'DESC']);
    }

    // S'assurer que nous utilisons correctement les relations Client -> Utilisateur
    const { count, rows: commandes } = await Commande.findAndCountAll({
      where: whereCondition,
      order,
      limit,
      offset,
      include: [{
        model: Client,
        required: false,
        include: [{
          model: Utilisateur,
          attributes: ['id_utilisateur', 'nom', 'email', 'username']
        }]
      }, {
        model: Paiement,
        required: false
      }]
    });

    // Pour le débogage, regardons la structure des données
    // console.log('Premier résultat:', JSON.stringify(commandes[0], null, 2));

    // Créer un format uniforme pour les réponses
    const commandesFormatted = commandes.map(commande => {
      const plainCommande = commande.get({ plain: true });
      
      // Si nous avons un Client avec un Utilisateur, extraire les informations
      if (plainCommande.Client && plainCommande.Client.Utilisateur) {
        plainCommande.clientInfo = {
          nom: plainCommande.Client.Utilisateur.nom || plainCommande.Client.Utilisateur.username || 'Sans nom',
          email: plainCommande.Client.Utilisateur.email
        };
      } else {
        plainCommande.clientInfo = {
          nom: 'Client ID: ' + plainCommande.id_client,
          email: 'Non disponible'
        };
      }
      
      return plainCommande;
    });

    res.json({
      commandes: commandesFormatted,
      page,
      pages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Récupérer les détails d'une commande
// @route   GET /api/back/orders/:id
// @access  Private/Admin
const getOrderById = async (req, res) => {
  try {
    const commandeId = req.params.id;

    const commande = await Commande.findByPk(commandeId, {
      include: [
        {
          model: Client,
          include: [{
            model: Utilisateur,
            attributes: ['id_utilisateur', 'nom', 'email', 'adresse']
          }]
        },
        {
          model: Livre,
          through: {
            model: ItemCommande,
            attributes: ['quantite', 'prix_unitaire']
          }
        },
        {
          model: Paiement
        }
      ]
    });

    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Transformer les données pour inclure les informations de l'utilisateur
    const commandeFormatted = commande.get({ plain: true });
    if (commandeFormatted.Client && commandeFormatted.Client.Utilisateur) {
      commandeFormatted.Utilisateur = commandeFormatted.Client.Utilisateur;
    }

    res.json(commandeFormatted);
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Mettre à jour le statut d'une commande
// @route   PUT /api/back/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const commandeId = req.params.id;
    const { statut } = req.body;

    const commande = await Commande.findByPk(commandeId);
    
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Vérifier que le statut est valide
    const statutsValides = ['EN_ATTENTE', 'VALIDEE', 'EN_COURS_DE_LIVRAISON', 'LIVREE', 'ANNULEE'];
    if (!statutsValides.includes(statut)) {
      return res.status(400).json({ message: 'Statut de commande invalide' });
    }

    await commande.update({ statut });

    res.json({
      message: 'Statut de la commande mis à jour',
      commande
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de la commande:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Fonction pour les commandes de l'utilisateur connecté (pour le front)
const getUserOrders = async (req, res) => {
  try {
    const clientId = req.user.id_client;

    const commandes = await Commande.findAll({
      where: { id_client: clientId },
      include: [{
        model: Livre,
        through: {
          model: ItemCommande,
          attributes: ['quantite', 'prix_unitaire']
        }
      }, {
        model: Paiement
      }],
      order: [['date_commande', 'DESC']]
    });

    res.json(commandes);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  updateOrderStatus,
  getUserOrders
};