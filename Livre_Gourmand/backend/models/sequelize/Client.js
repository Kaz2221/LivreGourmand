const { DataTypes } = require('sequelize');
const Utilisateur = require('./Utilisateur');
const databaseSingleton = require('../../config/DatabaseSingleton');
const sequelize = databaseSingleton.getSequelize();

const Client = sequelize.define('client', {
  id_client: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_utilisateur: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'utilisateurs',
      key: 'id_utilisateur'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'clients',
  timestamps: false
});

// Définir les associations
Client.belongsTo(Utilisateur, { foreignKey: 'id_utilisateur' });
Utilisateur.hasOne(Client, { foreignKey: 'id_utilisateur' });

module.exports = Client;