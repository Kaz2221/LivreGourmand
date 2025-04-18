// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');

// Middleware pour protéger les routes avec un token JWT
const protect = async (req, res, next) => {
  let token;

  // Vérifier si le token est présent dans le header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extraire le token
      token = req.headers.authorization.split(' ')[1];

      // Vérifier et décoder le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt');

      // Récupérer l'utilisateur en base (sans mot de passe)
      const utilisateur = await Utilisateur.findByPk(decoded.id_utilisateur, {
        attributes: { exclude: ['mot_de_passe'] }
      });

      if (!utilisateur) {
        return res.status(401).json({ message: 'Utilisateur introuvable' });
      }

      // Fusionner les infos de la base + celles du token (ex: id_client)
      req.user = {
        ...utilisateur.toJSON(),
        id_client: decoded.id_client,
        type_utilisateur: decoded.type_utilisateur
      };

      // ✅ Affichage temporaire pour vérifier ce qui est reçu
      // console.log('Utilisateur authentifié :', req.user);

      next();
    } catch (error) {
      console.error('Erreur d\'authentification :', error);
      return res.status(401).json({ message: 'Non autorisé, token invalide' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé, pas de token' });
  }
};


// Middleware pour vérifier le rôle d'utilisateur
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
