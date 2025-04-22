// backend/controllers/back/orderController.js
const { Commande, ItemCommande, Utilisateur, Livre, Paiement } = require('../../models');
const { Op } = require('sequelize');

const getUserOrders = async (req, res) => {
  try {
    const clientId = req.user.id_client;

    const commandes = await Commande.findAll({
      where: { id_client: clientId },
      include: [
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
      ],
      order: [['date_commande', 'DESC']]
    });

    res.json(commandes);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
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

    const { count, rows: commandes } = await Commande.findAndCountAll({
      where: whereCondition,
      order,
      limit,
      offset,
      include: [
        {
          model: Utilisateur,
          attributes: ['id_utilisateur', 'nom', 'email'],
          through: { attributes: [] }
        },
        {
          model: Paiement
        }
      ]
    });

    res.json({
      commandes,
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
          model: Utilisateur,
          attributes: ['id_utilisateur', 'nom', 'email', 'adresse']
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

    res.json(commande);
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

module.exports = {
  getOrders,
  getOrderById,
  updateOrderStatus,
  getUserOrders
};