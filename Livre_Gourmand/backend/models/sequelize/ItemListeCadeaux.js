const { DataTypes } = require('sequelize');
const databaseSingleton = require('../../config/DatabaseSingleton');
const ListeCadeaux = require('./ListeCadeaux');
const Livre = require('./Livre');
const Utilisateur = require('./Utilisateur');

const sequelize = databaseSingleton.getSequelize();
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

// Définir les associations
ItemListeCadeaux.belongsTo(ListeCadeaux, { foreignKey: 'id_liste_cadeaux' });
ItemListeCadeaux.belongsTo(Livre, { foreignKey: 'id_livre' });
ItemListeCadeaux.belongsTo(Utilisateur, { foreignKey: 'id_acheteur', as: 'acheteur' });
ListeCadeaux.belongsToMany(Livre, { through: ItemListeCadeaux, foreignKey: 'id_liste_cadeaux' });
Livre.belongsToMany(ListeCadeaux, { through: ItemListeCadeaux, foreignKey: 'id_livre' });

module.exports = ItemListeCadeaux;