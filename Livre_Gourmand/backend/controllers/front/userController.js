// backend/controllers/front/userController.js
const { Utilisateur, Client } = require('../../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Génération du token JWT
const generateToken = (id_utilisateur, type_utilisateur, id_client) => {
  return jwt.sign(
    { id_utilisateur, type_utilisateur, id_client },
    process.env.JWT_SECRET || 'votre_secret_jwt',
    { expiresIn: '30d' }
  );
};

// @desc    Inscrire un nouvel utilisateur
// @route   POST /api/front/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, nom, email, password, adresse } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await Utilisateur.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
    }

    // Créer l'utilisateur
    const utilisateur = await Utilisateur.create({
      username,
      nom,
      email,
      mot_de_passe: password, // Le hachage est géré par les hooks Sequelize
      adresse,
      type_utilisateur: 'client' // Par défaut, les nouveaux inscrits sont des clients
    });

    // Créer un client associé
    const client = await Client.create({
      id_utilisateur: utilisateur.id_utilisateur
    });

    // Générer un token JWT
    const token = generateToken(utilisateur.id_utilisateur, utilisateur.type_utilisateur, client.id_client);

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: utilisateur.id_utilisateur,
        username: utilisateur.username,
        nom: utilisateur.nom,
        email: utilisateur.email,
        type: utilisateur.type_utilisateur
      },
      token
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription', error: error.message });
  }
};

// @desc    Connecter un utilisateur
// @route   POST /api/front/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Récupération de l'utilisateur
    const utilisateur = await Utilisateur.findOne({ where: { email } });
    if (!utilisateur) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérification du mot de passe
    const isMatch = await utilisateur.verifierMotDePasse(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    // 💡 Récupération du client lié
    const client = await Client.findOne({
      where: { id_utilisateur: utilisateur.id_utilisateur }
    });

    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé pour cet utilisateur' });
    }

    // ✅ Génération du token AVEC id_client
    const token = generateToken(
      utilisateur.id_utilisateur,
      utilisateur.type_utilisateur,
      client.id_client
    );

    res.json({
      message: 'Connexion réussie',
      user: {
        id: utilisateur.id_utilisateur,
        username: utilisateur.username,
        nom: utilisateur.nom,
        email: utilisateur.email,
        type: utilisateur.type_utilisateur,
        id_client: client.id_client // 👈 très utile côté front aussi
      },
      token
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
  }
};


// @desc    Obtenir le profil de l'utilisateur connecté
// @route   GET /api/front/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.user.id_utilisateur);
    
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({
      id: utilisateur.id_utilisateur,
      username: utilisateur.username,
      nom: utilisateur.nom,
      email: utilisateur.email,
      adresse: utilisateur.adresse,
      type: utilisateur.type_utilisateur
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Mettre à jour le profil de l'utilisateur connecté
// @route   PUT /api/front/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.user.id_utilisateur);
    
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Mettre à jour les champs si fournis
    if (req.body.username) utilisateur.username = req.body.username;
    if (req.body.nom) utilisateur.nom = req.body.nom;
    if (req.body.email) utilisateur.email = req.body.email;
    if (req.body.adresse) utilisateur.adresse = req.body.adresse;
    
    // Si un nouveau mot de passe est fourni, le mettre à jour
    if (req.body.password) {
      utilisateur.mot_de_passe = req.body.password;
    }

    await utilisateur.save();

    // Retourner l'utilisateur sans le mot de passe
    res.json({
      id: utilisateur.id_utilisateur,
      username: utilisateur.username,
      nom: utilisateur.nom,
      email: utilisateur.email,
      adresse: utilisateur.adresse,
      type: utilisateur.type_utilisateur
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile 
};