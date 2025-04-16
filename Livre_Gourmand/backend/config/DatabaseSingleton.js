// backend/config/DatabaseSingleton.js
const { Sequelize } = require('sequelize');

class DatabaseSingleton {
  constructor() {
    if (DatabaseSingleton.instance) {
      return DatabaseSingleton.instance;
    }

    this.sequelize = new Sequelize(
      'LivreGourmand',      // Nom de la base de données
      'postgres',           // Nom d'utilisateur
      'djibril21', // Mot de passe - assurez-vous qu'il s'agit d'une chaîne, pas undefined ou null
      {
        host: 'localhost',
        port: 5432,
        dialect: 'postgres',
        logging: false
      }
    );

    DatabaseSingleton.instance = this;
  }

  getSequelize() {
    return this.sequelize;
  }

  async testConnection() {
    try {
      await this.sequelize.authenticate();
      console.log('Connexion à la base de données établie avec succès.');
      return true;
    } catch (error) {
      console.error('Impossible de se connecter à la base de données:', error);
      return false;
    }
  }

  async syncDatabase(force = false) {
    try {
      await this.sequelize.sync({ force });
      console.log(`Base de données ${force ? 'recréée' : 'synchronisée'}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la synchronisation de la base de données:', error);
      return false;
    }
  }
}

// Exporter une instance unique
const databaseSingleton = new DatabaseSingleton();
module.exports = databaseSingleton;