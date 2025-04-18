// models/ListeCadeaux.js
const { DataTypes } = require('sequelize');
const databaseSingleton = require('../../config/DatabaseSingleton');
const sequelize = databaseSingleton.getSequelize();

const Client = require('./Client');
const Livre = require('./Livre');
const ItemListeCadeaux = require('./ItemListeCadeaux');

const ListeCadeaux = sequelize.define('liste_cadeaux', {
  id_liste_cadeaux: {
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
  nom_liste: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  code_acces: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  date_expiration: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'listes_cadeaux',
  timestamps: false
});

// Associations
ListeCadeaux.belongsTo(Client, { foreignKey: 'id_client' });
Client.hasMany(ListeCadeaux, { foreignKey: 'id_client' });

ListeCadeaux.belongsToMany(Livre, {
  through: ItemListeCadeaux,
  foreignKey: 'id_liste_cadeaux',
  otherKey: 'id_livre',
  as: 'Livres'
});

Livre.belongsToMany(ListeCadeaux, {
  through: ItemListeCadeaux,
  foreignKey: 'id_livre',
  otherKey: 'id_liste_cadeaux',
  as: 'Listes'
});

module.exports = ListeCadeaux;
