const { DataTypes } = require('sequelize');
const databaseSingleton = require('../../config/DatabaseSingleton');
const Commande = require('./Commande');
const sequelize = databaseSingleton.getSequelize();


const Paiement = sequelize.define('paiement', {
  id_paiement: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_commande: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'commandes',
      key: 'id_commande'
    },
    onDelete: 'CASCADE'
  },
  montant: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  mode_paiement: {
    type: DataTypes.ENUM('VISA', 'MASTERCARD', 'AMERICAN_EXPRESS', 'DEBIT', 'PAYPAL'),
    allowNull: false
  },
  statut: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  date_paiement: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  reference_transaction: {
    type: DataTypes.STRING(100),
    unique: true
  }
}, {
  tableName: 'paiements',
  timestamps: false
});

// Définir les associations
Paiement.belongsTo(Commande, { foreignKey: 'id_commande' });
Commande.hasMany(Paiement, { foreignKey: 'id_commande' });

module.exports = Paiement;