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
    const { periode = 'mois' } = req.query; // jour, semaine, mois, annee
    let groupBy, dateFormat;
    let startDate = new Date();
    let dateCondition = {};

    // Configurer la période
    switch (periode) {
      case 'jour':
        startDate.setDate(startDate.getDate() - 30); // 30 derniers jours
        groupBy = 'jour';
        dateFormat = 'YYYY-MM-DD'; // PostgreSQL
        break;
      case 'semaine':
        startDate.setMonth(startDate.getMonth() - 3); // 3 derniers mois par semaine
        groupBy = 'semaine';
        dateFormat = 'IYYY-IW'; // ISO Year-Week
        break;
      case 'mois':
        startDate.setFullYear(startDate.getFullYear() - 1); // 12 derniers mois
        groupBy = 'mois';
        dateFormat = 'YYYY-MM'; // PostgreSQL
        break;
      case 'annee':
        startDate.setFullYear(startDate.getFullYear() - 5); // 5 dernières années
        groupBy = 'annee';
        dateFormat = 'YYYY'; // PostgreSQL
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 12); // 12 derniers mois par défaut
        groupBy = 'mois';
        dateFormat = 'YYYY-MM';
    }

    dateCondition = {
      date_commande: {
        [Op.gte]: startDate
      }
    };

    // Requête SQL pour obtenir les données de ventes par période
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

    // Si aucune donnée, générer des données fictives pour le développement
    if (ventes.length === 0) {
      // Générer des données de test basées sur la période
      let demoData = [];
      const currentDate = new Date();
      
      if (periode === 'mois') {
        const monthNames = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
        demoData = Array(6).fill().map((_, i) => {
          const monthIndex = (currentDate.getMonth() - 5 + i) % 12;
          const year = currentDate.getFullYear() - (monthIndex > currentDate.getMonth() ? 1 : 0);
          return {
            mois: `${year}-${monthNames[monthIndex]}`,
            commandes: Math.floor(Math.random() * 50) + 10,
            total: (Math.random() * 5000 + 1000).toFixed(2)
          };
        });
      } else if (periode === 'jour') {
        demoData = Array(14).fill().map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - 13 + i);
          const formattedDate = date.toISOString().split('T')[0];
          return {
            jour: formattedDate,
            commandes: Math.floor(Math.random() * 10) + 1,
            total: (Math.random() * 500 + 100).toFixed(2)
          };
        });
      } else if (periode === 'semaine') {
        demoData = Array(12).fill().map((_, i) => {
          return {
            semaine: `2025-${i + 1 < 10 ? '0' + (i + 1) : i + 1}`,
            commandes: Math.floor(Math.random() * 20) + 5,
            total: (Math.random() * 2000 + 500).toFixed(2)
          };
        });
      } else if (periode === 'annee') {
        demoData = Array(5).fill().map((_, i) => {
          return {
            annee: `${currentDate.getFullYear() - 4 + i}`,
            commandes: Math.floor(Math.random() * 100) + 50,
            total: (Math.random() * 50000 + 10000).toFixed(2)
          };
        });
      }
      
      res.json(demoData);
      return;
    }

    // Formater les résultats
    const formattedData = ventes.map(item => {
      const plainItem = item.get({ plain: true });
      return {
        [periode]: plainItem[groupBy],
        commandes: parseInt(plainItem.commandes),
        total: parseFloat(plainItem.total)
      };
    });

    res.json(formattedData);
  } catch (error) {
    console.error('Erreur lors de la récupération des données de ventes:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getSalesData
};