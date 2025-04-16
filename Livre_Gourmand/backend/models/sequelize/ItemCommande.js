const { DataTypes } = require('sequelize');
const databaseSingleton = require('../../config/DatabaseSingleton');
const Commande = require('./Commande');
const Livre = require('./Livre');

const sequelize = databaseSingleton.getSequelize();

const ItemCommande = sequelize.define('item_commande', {
  id_commande: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'commandes',
      key: 'id_commande'
    },
    onDelete: 'CASCADE'
  },
  id_livre: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'livres',
      key: 'id_livre'
    },
    onDelete: 'SET NULL'
  },
  quantite: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  prix_unitaire: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'items_commande',
  timestamps: false
});

// Définir les associations
ItemCommande.belongsTo(Commande, { foreignKey: 'id_commande' });
ItemCommande.belongsTo(Livre, { foreignKey: 'id_livre' });
Commande.belongsToMany(Livre, { through: ItemCommande, foreignKey: 'id_commande' });
Livre.belongsToMany(Commande, { through: ItemCommande, foreignKey: 'id_livre' });

module.exports = ItemCommande;