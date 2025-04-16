const { Sequelize } = require('sequelize');

// Configuration mise à jour avec le bon nom de base de données
const sequelize = new Sequelize('LivreGourmand', 'postgres', 'djibril21', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: console.log
});

// Fonction pour tester la connexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie avec succès.');
  } catch (error) {
    console.error('Impossible de se connecter à la base de données:', error);
  }
};

module.exports = {
  sequelize,
  testConnection
};