// models/Livre.js
const { DataTypes } = require('sequelize');
const databaseSingleton = require('../../config/DatabaseSingleton');
const sequelize = databaseSingleton.getSequelize();

const Livre = sequelize.define('livre', {
  id_livre: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  auteur: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  editeur: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  categorie: {
    type: DataTypes.ENUM('FRANCAISE', 'ITALIENNE', 'ASIATIQUE', 'VEGETARIENNE', 'PATISSERIE', 'VINS', 'AUTRE'),
    allowNull: false
  },
  prix: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  niveau_expertise: {
    type: DataTypes.ENUM('DEBUTANT', 'INTERMEDIAIRE', 'EXPERT'),
    allowNull: false
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  date_ajout: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'livres',
  timestamps: false
});

module.exports = Livre;