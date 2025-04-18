const { DataTypes } = require('sequelize');
const databaseSingleton = require('../../config/DatabaseSingleton');
const sequelize = databaseSingleton.getSequelize();

// Déclare le modèle sans les associations
const ItemListeCadeaux = sequelize.define('item_liste_cadeaux', {
  id_liste_cadeaux: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'listes_cadeaux',
      key: 'id_liste_cadeaux'
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
  achete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  id_acheteur: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'utilisateurs',
      key: 'id_utilisateur'
    }
  }
}, {
  tableName: 'items_liste_cadeaux',
  timestamps: false
});

module.exports = ItemListeCadeaux;
