// backend/builders/CommandeBuilder.js
const { Commande, ItemCommande, Livre } = require('../models');

class CommandeBuilder {
  constructor(clientId) {
    this.reset();
    this.commandeData.id_client = clientId;
  }

  reset() {
    this.commandeData = {
      id_client: null,
      statut: 'EN_ATTENTE',
      montant_total: 0,
      transaction_id: null, // Ajout du champ transaction_id
      items: []
    };
    return this;
  }

  addItem(livreId, quantite, prixUnitaire) {
    this.commandeData.items.push({
      id_livre: livreId,
      quantite,
      prix_unitaire: prixUnitaire
    });
    
    // Recalculer le montant total
    this.commandeData.montant_total = this.commandeData.items.reduce(
      (total, item) => total + (item.quantite * item.prix_unitaire),
      0
    );
    
    return this;
  }

  setStatut(statut) {
    this.commandeData.statut = statut;
    return this;
  }

  // Nouvelle méthode pour définir l'ID de transaction
  setTransactionId(transactionId) {
    this.commandeData.transaction_id = transactionId;
    return this;
  }

  async build() {
    try {
      // Créer la commande dans la base de données avec transaction_id
      const commande = await Commande.create({
        id_client: this.commandeData.id_client,
        statut: this.commandeData.statut,
        montant_total: this.commandeData.montant_total,
        transaction_id: this.commandeData.transaction_id // Inclure le transaction_id
      });

      // Ajouter les items de commande
      for (const item of this.commandeData.items) {
        await ItemCommande.create({
          id_commande: commande.id_commande,
          id_livre: item.id_livre,
          quantite: item.quantite,
          prix_unitaire: item.prix_unitaire
        });
      }

      // Retourner la commande complète avec ses items
      const commandeComplete = await Commande.findByPk(commande.id_commande, {
        include: [{
          model: Livre,
          through: {
            attributes: ['quantite', 'prix_unitaire']
          }
        }]
      });

      return commandeComplete;
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      throw error;
    }
  }
}

module.exports = CommandeBuilder;