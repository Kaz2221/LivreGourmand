// backend/controllers/front/orderController.js
const CommandeBuilder = require('../../builders/CommandeBuilder');
const { Livre } = require('../../models');

// @desc    Créer une nouvelle commande
// @route   POST /api/front/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    const clientId = req.user.id_client;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Veuillez ajouter au moins un article à votre commande' });
    }

    // Utiliser le CommandeBuilder
    const commandeBuilder = new CommandeBuilder(clientId);

    // Vérifier la disponibilité des livres et ajouter les items
    for (const item of items) {
      const livre = await Livre.findByPk(item.id_livre);
      
      if (!livre) {
        return res.status(404).json({ message: `Livre avec ID ${item.id_livre} non trouvé` });
      }
      
      if (livre.stock < item.quantite) {
        return res.status(400).json({ message: `Stock insuffisant pour le livre "${livre.titre}"` });
      }
      
      commandeBuilder.addItem(livre.id_livre, item.quantite, livre.prix);
      
      // Mettre à jour le stock
      await livre.update({ stock: livre.stock - item.quantite });
    }

    // Construire la commande
    const commande = await commandeBuilder.build();

    res.status(201).json({
      message: 'Commande créée avec succès',
      commande
    });
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Autres fonctions du contrôleur...

module.exports = {
  createOrder
};