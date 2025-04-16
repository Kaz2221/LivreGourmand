const { DataTypes } = require('sequelize');
const databaseSingleton = require('../../config/DatabaseSingleton');
const Panier = require('./Panier');
const Livre = require('./Livre');
const sequelize = databaseSingleton.getSequelize();


const ItemPanier = sequelize.define('item_panier', {
  id_panier: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'paniers',
      key: 'id_panier'
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
    onDelete: 'CASCADE'
  },
  quantite: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  prix_unitaire: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'items_panier',
  timestamps: false
});

// Définir les associations
ItemPanier.belongsTo(Panier, { foreignKey: 'id_panier' });
ItemPanier.belongsTo(Livre, { foreignKey: 'id_livre' });
Panier.belongsToMany(Livre, { through: ItemPanier, foreignKey: 'id_panier' });
Livre.belongsToMany(Panier, { through: ItemPanier, foreignKey: 'id_livre' });

module.exports = ItemPanier;