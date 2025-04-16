const { DataTypes } = require('sequelize');
const Livre = require('./Livre');
const Client = require('./Client');
const databaseSingleton = require('../../config/DatabaseSingleton');
const sequelize = databaseSingleton.getSequelize();

const Avis = sequelize.define('avis', {
  id_avis: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_livre: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'livres',
      key: 'id_livre'
    },
    onDelete: 'CASCADE'
  },
  id_client: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'clients',
      key: 'id_client'
    },
    onDelete: 'SET NULL'
  },
  note: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  commentaire: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date_avis: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  valide: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'avis',
  timestamps: false
});

// Définir les associations
Avis.belongsTo(Livre, { foreignKey: 'id_livre' });
Avis.belongsTo(Client, { foreignKey: 'id_client' });
Livre.hasMany(Avis, { foreignKey: 'id_livre' });
Client.hasMany(Avis, { foreignKey: 'id_client' });

module.exports = Avis;