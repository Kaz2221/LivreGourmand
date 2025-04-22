// backend/controllers/back/dashboardController.js
const { Commande, Utilisateur, Livre, Avis, ItemCommande } = require('../../models');
const sequelize = require('../../config/DatabaseSingleton').getSequelize();
const { Op } = require('sequelize');

// @desc    Récupérer les statistiques pour le tableau de bord admin
// @route   GET /api/back/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // Période de temps (30 derniers jours par défaut)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Statistiques des commandes
    const commandesCount = await Commande.count();
    const commandesEnAttente = await Commande.count({ where: { statut: 'EN_ATTENTE' } });
    const commandesRecentes = await Commande.count({
      where: {
        date_commande: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    // Chiffre d'affaires
    const chiffreAffaires = await Commande.sum('montant_total', {
      where: {
        statut: {
          [Op.ne]: 'ANNULEE'
        }
      }
    });

    const chiffreAffairesMois = await Commande.sum('montant_total', {
      where: {
        statut: {
          [Op.ne]: 'ANNULEE'
        },
        date_commande: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    // Statistiques utilisateurs
    const utilisateursCount = await Utilisateur.count();
    const nouveauxUtilisateurs = await Utilisateur.count({
      where: {
        date_creation: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    // Produits populaires
    const produitsPop = await ItemCommande.findAll({
      attributes: [
        ['id_livre', 'id_livre'],
        [sequelize.fn('SUM', sequelize.col('quantite')), 'total_vendu']
      ],
      include: [{
        model: Livre,
        attributes: ['id_livre', 'titre', 'prix', 'stock']
      }],
      group: ['item_commande.id_livre', 'livre.id_livre'],
      order: [[sequelize.literal('total_vendu'), 'DESC']],
      limit: 5
    });

    // Produits en rupture ou presque
    const produitsEnRupture = await Livre.findAll({
      where: {
        stock: { [Op.lt]: 5 }
      },
      order: [['stock', 'ASC']],
      limit: 5
    });

    // Avis récents en attente de validation
    const avisEnAttente = await Avis.count({
      where: {
        valide: false
      }
    });

    res.json({
      commandes: {
        total: commandesCount,
        enAttente: commandesEnAttente,
        recentes: commandesRecentes
      },
      ventes: {
        total: chiffreAffaires || 0,
        mois: chiffreAffairesMois || 0
      },
      utilisateurs: {
        total: utilisateursCount,
        nouveaux: nouveauxUtilisateurs
      },
      produits: {
        populaires: produitsPop,
        enRupture: produitsEnRupture
      },
      avis: {
        enAttente: avisEnAttente
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Récupérer les ventes par période
// @route   GET /api/back/dashboard/sales
// @access  Private/Admin
const getSalesData = async (req, res) => {
  try {
    const { periode } = req.query; // jour, semaine, mois, annee
    let groupBy, dateFormat;
    let startDate = new Date();
    let dateCondition = {};

    // Configurer la période
    switch (periode) {
      case 'jour':
        startDate.setDate(startDate.getDate() - 30);
        groupBy = 'date';
        dateFormat = 'YYYY-MM-DD'; // ✅ PostgreSQL
        break;
      case 'semaine':
        startDate.setMonth(startDate.getMonth() - 3);
        groupBy = 'semaine';
        dateFormat = 'IYYY-IW'; // ✅ ISO Year-Week
        break;
      case 'mois':
        startDate.setFullYear(startDate.getFullYear() - 1);
        groupBy = 'mois';
        dateFormat = 'YYYY-MM'; // ✅ PostgreSQL
        break;
      case 'annee':
        startDate.setFullYear(startDate.getFullYear() - 5);
        groupBy = 'annee';
        dateFormat = 'YYYY'; // ✅ PostgreSQL
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
        groupBy = 'date';
        dateFormat = 'YYYY-MM-DD'; // ✅ fallback
    }

    dateCondition = {
      date_commande: {
        [Op.gte]: startDate
      }
    };

    const ventes = await Commande.findAll({
      attributes: [
        [sequelize.fn('to_char', sequelize.col('date_commande'), dateFormat), groupBy],
        [sequelize.fn('COUNT', sequelize.col('id_commande')), 'commandes'],
        [sequelize.fn('SUM', sequelize.col('montant_total')), 'total']
      ],
      where: {
        ...dateCondition,
        statut: {
          [Op.ne]: 'ANNULEE'
        }
      },
      group: [sequelize.fn('to_char', sequelize.col('date_commande'), dateFormat)],
      order: [[sequelize.literal(groupBy), 'ASC']]
    });

    res.json(ventes);
  } catch (error) {
    console.error('Erreur lors de la récupération des données de ventes:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getSalesData
};