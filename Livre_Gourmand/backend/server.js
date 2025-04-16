const express = require('express');
const cors = require('cors');
const path = require('path');
const databaseSingleton = require('./config/DatabaseSingleton');

// Routes front
const userRoutes = require('./routes/front/userRoutes');
const bookRoutes = require('./routes/front/bookRoutes');
const cartRoutes = require('./routes/front/cartRoutes');
const orderRoutes = require('./routes/front/orderRoutes');
const wishlistRoutes = require('./routes/front/wishlistRoutes');

// Routes back
const backBookRoutes = require('./routes/back/bookRoutes');
const backOrderRoutes = require('./routes/back/orderRoutes');
const backDashboardRoutes = require('./routes/back/dashboardRoutes');

// Création de l'application Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Test de la connexion à la base de données avec le Singleton
databaseSingleton.testConnection();

// Routes front-end
app.use('/api/front/users', userRoutes);
app.use('/api/front/books', bookRoutes);
app.use('/api/front/cart', cartRoutes);
app.use('/api/front/orders', orderRoutes);
app.use('/api/front/wishlists', wishlistRoutes);

// Routes back-end
app.use('/api/back/books', backBookRoutes);
app.use('/api/back/orders', backOrderRoutes);
app.use('/api/back/dashboard', backDashboardRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API de Livres Gourmands' });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Une erreur est survenue',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Erreur serveur'
  });
});

// Configuration du port et démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

app.get('/api/test-db', async (req, res) => {
  try {
    const [results] = await databaseSingleton.getSequelize().query("SELECT NOW() as now");
    res.json({
      message: 'Connexion à la base de données réussie',
      timestamp: results[0].now,
      database: process.env.DB_NAME
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur de connexion à la base de données',
      error: error.message
    });
  }
});
const startServer = async () => {
  try {
    // Tester la connexion
    const connected = await databaseSingleton.testConnection();
    
    if (connected) {
      // Synchroniser les modèles avec la base de données
      // Le paramètre 'false' signifie que les tables existantes ne seront pas supprimées
      await databaseSingleton.syncDatabase(false);
      
      // Démarrer le serveur
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`Serveur démarré sur le port ${PORT}`);
      });
    } else {
      console.error('Impossible de démarrer le serveur : échec de la connexion à la base de données');
    }
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
  }
};

startServer();
