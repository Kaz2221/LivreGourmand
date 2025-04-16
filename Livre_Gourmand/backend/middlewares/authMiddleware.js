const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');

// Middleware pour vérifier le token JWT et protéger les routes
const protect = async (req, res, next) => {
  let token;

  // Vérifier si le token existe dans les headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extraire le token du header
      token = req.headers.authorization.split(' ')[1];

      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt');

      // Récupérer l'utilisateur du token
      req.user = await Utilisateur.findByPk(decoded.id, {
        attributes: { exclude: ['mot_de_passe'] }
      });

      next();
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      res.status(401).json({ message: 'Non autorisé, token invalide' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Non autorisé, pas de token' });
  }
};

// Middleware pour vérifier si l'utilisateur a un rôle spécifique
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.type_utilisateur)) {
      return res.status(403).json({ 
        message: `L'utilisateur de type ${req.user.type_utilisateur} n'est pas autorisé à accéder à cette ressource` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };