// backend/controllers/front/orderController.js
const CommandeBuilder = require('../../builders/CommandeBuilder');
const { Commande, ItemCommande, Livre, Panier, ItemPanier, Paiement } = require('../../models');
const { Op } = require('sequelize');

// Table en mémoire pour suivre les transactions traitées
// Dans un environnement de production, utilisez une table en base de données
const processedTransactions = new Map();

// @desc    Créer une nouvelle commande
// @route   POST /api/front/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { items, paiement_direct = false, transaction_id = null } = req.body;
    const clientId = req.user.id_client;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Veuillez ajouter au moins un article à votre commande' });
    }

    // Si un ID de transaction est fourni, vérifier dans la base de données s'il existe déjà
    if (transaction_id) {
      console.log(`Vérification de la transaction ${transaction_id}`);

      // Vérifier si cette transaction existe déjà dans la base de données
      const commandeExistante = await Commande.findOne({
        where: { transaction_id },
        include: [
          {
            model: Livre,
            through: {
              model: ItemCommande,
              attributes: ['quantite', 'prix_unitaire']
            }
          }
        ]
      });

      if (commandeExistante) {
        console.log(`Transaction ${transaction_id} déjà traitée, commande ${commandeExistante.id_commande} trouvée`);
        return res.status(200).json({
          message: 'Cette transaction a déjà été traitée',
          commande: commandeExistante
        });
      }
    }

    // Préparer les données de commande
    let montantTotal = 0;
    const itemsToProcess = [];

    for (const item of items) {
      const livre = await Livre.findByPk(item.id_livre);

      if (!livre) {
        return res.status(404).json({ message: `Livre avec ID ${item.id_livre} non trouvé` });
      }

      // S'assurer que la quantité est un nombre
      const quantite = parseInt(item.quantity || item.quantite || 1);

      if (isNaN(quantite) || quantite <= 0) {
        return res.status(400).json({
          message: `Quantité invalide pour le livre "${livre.titre}". Doit être un nombre positif.`
        });
      }

      if (livre.stock < quantite) {
        return res.status(400).json({ message: `Stock insuffisant pour le livre "${livre.titre}"` });
      }

      montantTotal += livre.prix * quantite;
      itemsToProcess.push({ livre, quantite });
    }

    // Créer la commande avec le CommandeBuilder
    const commandeBuilder = new CommandeBuilder(clientId);

    // IMPORTANT: Si on a un transaction_id, on doit le définir ici
    if (transaction_id) {
      commandeBuilder.setTransactionId(transaction_id);
    }

    // Ajouter les items à la commande et mettre à jour le stock
    for (const { livre, quantite } of itemsToProcess) {
      commandeBuilder.addItem(livre.id_livre, quantite, livre.prix);

      // Mettre à jour le stock si le paiement est direct
      if (paiement_direct) {
        const nouveauStock = Math.max(0, livre.stock - quantite);
        await livre.update({ stock: nouveauStock });
      }
    }

    // Définir le statut
    if (paiement_direct) {
      commandeBuilder.setStatut('VALIDEE');
    } else {
      commandeBuilder.setStatut('EN_ATTENTE');
    }

    // Construire la commande - le transaction_id sera déjà inclus
    const commande = await commandeBuilder.build();

    // Si paiement direct, vider le panier
    if (paiement_direct) {
      try {
        const panier = await Panier.findOne({ where: { id_client: clientId } });
        if (panier) {
          await ItemPanier.destroy({ where: { id_panier: panier.id_panier } });
          await panier.update({ prix_total: 0 });
        }
      } catch (error) {
        console.error('Erreur lors du vidage du panier:', error);
        // On continue même si le vidage du panier échoue
      }
    }

    res.status(201).json({
      message: 'Commande créée avec succès',
      commande
    });
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    
    // Si c'est une erreur de contrainte unique sur transaction_id
    if (error.name === 'SequelizeUniqueConstraintError' && 
        error.errors && 
        error.errors.length > 0 && 
        error.errors[0].path === 'transaction_id') {
      
      const transaction_id = error.errors[0].value;
      
      // Récupérer la commande existante avec cette transaction_id
      try {
        const existingCommand = await Commande.findOne({
          where: { transaction_id },
          include: [
            {
              model: Livre,
              through: {
                model: ItemCommande,
                attributes: ['quantite', 'prix_unitaire']
              }
            }
          ]
        });
        
        if (existingCommand) {
          return res.status(200).json({
            message: 'Cette transaction a déjà été traitée',
            commande: existingCommand
          });
        }
      } catch (innerError) {
        console.error('Erreur lors de la récupération de la commande existante:', innerError);
      }
    }
    
    // Pour les autres erreurs, retourner un message d'erreur standard
    return res.status(500).json({ 
      message: 'Erreur serveur lors de la création de la commande', 
      error: error.message 
    });
  }
};

// @desc    Récupérer toutes les commandes de l'utilisateur connecté
// @route   GET /api/front/orders
// @access  Private
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

// @desc    Récupérer les détails d'une commande
// @route   GET /api/front/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const commandeId = req.params.id;
    const clientId = req.user.id_client;

    // Récupérer la commande de base
    const commande = await Commande.findOne({
      where: { id_commande: commandeId, id_client: clientId },
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
      ]
    });

    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Convertir en objet simple
    const commandeObj = commande.toJSON();
    
    // Corriger les propriétés de casse pour correspondre aux attentes du frontend
    // Si livres est défini mais Livres ne l'est pas
    if (commandeObj.livres && !commandeObj.Livres) {
      commandeObj.Livres = commandeObj.livres.map(livre => {
        // Corriger aussi la propriété item_commande en ItemCommande
        if (livre.item_commande) {
          livre.ItemCommande = livre.item_commande;
          delete livre.item_commande;
        }
        return livre;
      });
      
      // Supprimer la propriété originale
      delete commandeObj.livres;
    } 
    // Si aucun livre n'est trouvé, rechercher manuellement
    else if (!commandeObj.Livres || commandeObj.Livres.length === 0) {
      // Rechercher les items de commande
      const items = await ItemCommande.findAll({
        where: { id_commande: commandeId },
        include: [{ model: Livre }]
      });

      // Initialiser le tableau des livres
      commandeObj.Livres = [];

      // Ajouter chaque livre trouvé
      for (const item of items) {
        if (item.Livre) {
          const livre = item.Livre.toJSON();
          livre.ItemCommande = {
            quantite: item.quantite,
            prix_unitaire: item.prix_unitaire
          };
          commandeObj.Livres.push(livre);
        }
      }
    }

    res.json(commandeObj);
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
// @desc    Annuler une commande
// @route   PUT /api/front/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const commandeId = req.params.id;
    const clientId = req.user.id_client;

    const commande = await Commande.findOne({
      where: { id_commande: commandeId, id_client: clientId },
      include: [
        {
          model: Livre,
          through: {
            model: ItemCommande,
            attributes: ['quantite']
          }
        }
      ]
    });

    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Vérifier si la commande peut être annulée
    if (['LIVREE', 'ANNULEE'].includes(commande.statut)) {
      return res.status(400).json({
        message: `La commande ne peut pas être annulée car elle est déjà ${commande.statut.toLowerCase()}`
      });
    }

    // Remettre les articles en stock - avec vérification que Livres existe et est itérable
    if (commande.Livres && Array.isArray(commande.Livres)) {
      for (const livre of commande.Livres) {
        // Vérifier que l'objet ItemCommande existe et a une quantité
        if (livre.ItemCommande && typeof livre.ItemCommande.quantite !== 'undefined') {
          const quantite = parseInt(livre.ItemCommande.quantite);
          if (!isNaN(quantite) && quantite > 0) {
            // Assurer que le nouveau stock est un nombre valide
            const nouveauStock = livre.stock + quantite;
            await livre.update({ stock: nouveauStock });
          }
        }
      }
    } else {
      console.log("Attention: commande.Livres n'est pas itérable ou n'existe pas");
      // Récupérer les items de la commande directement depuis ItemCommande
      const items = await ItemCommande.findAll({
        where: { id_commande: commande.id_commande },
        include: [{ model: Livre }]
      });

      // Mettre à jour le stock pour chaque item
      for (const item of items) {
        if (item.Livre) {
          const quantite = parseInt(item.quantite);
          if (!isNaN(quantite) && quantite > 0) {
            const nouveauStock = item.Livre.stock + quantite;
            await item.Livre.update({ stock: nouveauStock });
          }
        }
      }
    }

    // Mettre à jour le statut de la commande
    await commande.update({ statut: 'ANNULEE' });

    // Récupérer la commande mise à jour avec tous ses livres pour la réponse
    const commandeMiseAJour = await Commande.findByPk(commande.id_commande, {
      include: [
        {
          model: Livre,
          through: {
            model: ItemCommande,
            attributes: ['quantite', 'prix_unitaire']
          }
        }
      ]
    });

    res.json({
      message: 'Commande annulée avec succès',
      commande: commandeMiseAJour
    });
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la commande:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder
};