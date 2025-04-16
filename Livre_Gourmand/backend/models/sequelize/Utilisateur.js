// backend/models/sequelize/Utilisateur.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const databaseSingleton = require('../../config/DatabaseSingleton');

const sequelize = databaseSingleton.getSequelize();

const Utilisateur = sequelize.define('utilisateur', {
  id_utilisateur: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  mot_de_passe: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [6, 100]
    }
  },
  adresse: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type_utilisateur: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['client', 'internaute', 'ami', 'editeur', 'gestionnaire', 'administrateur']]
    }
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'utilisateurs',
  timestamps: false,
  hooks: {
    beforeCreate: async (utilisateur) => {
      if (utilisateur.mot_de_passe) {
        const salt = await bcrypt.genSalt(10);
        utilisateur.mot_de_passe = await bcrypt.hash(utilisateur.mot_de_passe, salt);
      }
    },
    beforeUpdate: async (utilisateur) => {
      if (utilisateur.changed('mot_de_passe')) {
        const salt = await bcrypt.genSalt(10);
        utilisateur.mot_de_passe = await bcrypt.hash(utilisateur.mot_de_passe, salt);
      }
    }
  }
});

// Méthode pour vérifier le mot de passe
Utilisateur.prototype.verifierMotDePasse = async function(motDePasse) {
  return await bcrypt.compare(motDePasse, this.mot_de_passe);
};

module.exports = Utilisateur;