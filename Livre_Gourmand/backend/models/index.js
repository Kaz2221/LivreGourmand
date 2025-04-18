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
