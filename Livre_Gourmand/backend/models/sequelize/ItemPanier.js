const { DataTypes } = require('sequelize');
const sequelize = require('../../config/DatabaseSingleton').getSequelize();

const ItemPanier = sequelize.define('item_panier', {
  id_panier: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  id_livre: {
    type: DataTypes.INTEGER,
    primaryKey: true
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
  tableName: 'item_panier',
  timestamps: false
});

module.exports = ItemPanier;
