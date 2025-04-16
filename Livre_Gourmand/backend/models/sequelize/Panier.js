const { DataTypes } = require('sequelize');
const databaseSingleton = require('../../config/DatabaseSingleton');
const Client = require('./Client');
const sequelize = databaseSingleton.getSequelize();


const Panier = sequelize.define('panier', {
  id_panier: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_client: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id_client'
    },
    onDelete: 'CASCADE'
  },
  prix_total: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  date_modification: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'paniers',
  timestamps: false
});

// Définir les associations
Panier.belongsTo(Client, { foreignKey: 'id_client' });
Client.hasOne(Panier, { foreignKey: 'id_client' });

module.exports = Panier;