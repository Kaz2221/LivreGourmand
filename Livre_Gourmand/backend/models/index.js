const Utilisateur = require('./sequelize/Utilisateur');
const Client = require('./sequelize/Client');
const Livre = require('./sequelize/Livre');
const Panier = require('./sequelize/Panier');
const ItemPanier = require('./sequelize/ItemPanier');
const ListeCadeaux = require('./sequelize/ListeCadeaux');
const ItemListeCadeaux = require('./sequelize/ItemListeCadeaux');
const Commande = require('./sequelize/Commande');
const ItemCommande = require('./sequelize/ItemCommande');
const Paiement = require('./sequelize/Paiement');
const Avis = require('./sequelize/Avis');

// 📦 Association Panier ↔ Livre via ItemPanier
Panier.belongsToMany(Livre, {
  through: ItemPanier,
  foreignKey: 'id_panier',
  otherKey: 'id_livre',
  as: 'Livres' // utilisé dans getCart()
});

Livre.belongsToMany(Panier, {
  through: ItemPanier,
  foreignKey: 'id_livre',
  otherKey: 'id_panier',
  as: 'paniers'
});

// S'assurer que les associations Client -> Utilisateur sont bien définies
Client.belongsTo(Utilisateur, { foreignKey: 'id_utilisateur' });
Utilisateur.hasOne(Client, { foreignKey: 'id_utilisateur' });

// S'assurer que les associations Commande -> Client sont bien définies
Commande.belongsTo(Client, { foreignKey: 'id_client' });
Client.hasMany(Commande, { foreignKey: 'id_client' });

// Vérifiez que ces associations sont présentes et correctes
ItemCommande.belongsTo(Commande, { foreignKey: 'id_commande' });
ItemCommande.belongsTo(Livre, { foreignKey: 'id_livre' });
Commande.belongsToMany(Livre, { through: ItemCommande, foreignKey: 'id_commande' });
Livre.belongsToMany(Commande, { through: ItemCommande, foreignKey: 'id_livre' });

module.exports = {
  Utilisateur,
  Client,
  Livre,
  Panier,
  ItemPanier,
  ListeCadeaux,
  ItemListeCadeaux,
  Commande,
  ItemCommande,
  Paiement,
  Avis
};