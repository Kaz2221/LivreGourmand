const { DataTypes } = require('sequelize');
const Client = require('./Client');
const databaseSingleton = require('../../config/DatabaseSingleton');
const sequelize = databaseSingleton.getSequelize();

const Commande = sequelize.define('commande', {
  id_commande: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_client: {
    type: DataTypes.INTEGER,
    allowNull: true, // Peut être null si le client est supprimé
    references: {
      model: 'clients',
      key: 'id_client'
    },
    onDelete: 'SET NULL'
  },
  date_commande: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  statut: {
    type: DataTypes.ENUM('EN_ATTENTE', 'VALIDEE', 'EN_COURS_DE_LIVRAISON', 'LIVREE', 'ANNULEE'),
    defaultValue: 'EN_ATTENTE'
  },
  montant_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'commandes',
  timestamps: false
});

// Définir les associations
Commande.belongsTo(Client, { foreignKey: 'id_client' });
Client.hasMany(Commande, { foreignKey: 'id_client' });

module.exports = Commande;