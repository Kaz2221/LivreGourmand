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