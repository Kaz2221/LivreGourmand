const { DataTypes } = require('sequelize');
const Livre = require('./Livre');
const Utilisateur   = require('./Utilisateur');;
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
  id_client: {                // <-- on garde le nom id_client
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {              // <-- MAIS on référence maintenant utilisateurs
      model: 'utilisateurs',
      key: 'id_utilisateur'
    },
    onDelete: 'SET NULL'
  },
  note: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  commentaire: DataTypes.TEXT,
  date_avis:   { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  valide:      { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'avis',
  timestamps: false
});

// Définir les associations
Avis.belongsTo(Livre,       { foreignKey: 'id_livre' });
Avis.belongsTo(Utilisateur, { foreignKey: 'id_client', as: 'utilisateur' });

Livre.hasMany(Avis,         { foreignKey: 'id_livre' });
Utilisateur.hasMany(Avis,   { foreignKey: 'id_client', as: 'avis' });


module.exports = Avis;