// backend/controllers/front/bookController.js
const { Livre, Avis, Utilisateur } = require('../../models');
const { Op } = require('sequelize');

// @desc    Récupérer tous les livres
// @route   GET /api/front/books
// @access  Public
const getBooks = async (req, res) => {
  try {
    const { 
      categorie, 
      niveau_expertise, 
      search,
      min_price,
      max_price,
      sort
    } = req.query;

    // Construire les conditions de filtre
    let whereCondition = {};
    
    if (categorie) {
      whereCondition.categorie = categorie;
    }
    
    if (niveau_expertise) {
      whereCondition.niveau_expertise = niveau_expertise;
    }
    
    if (search) {
      whereCondition[Op.or] = [
        { titre: { [Op.iLike]: `%${search}%` } },
        { auteur: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (min_price) {
      whereCondition.prix = { ...whereCondition.prix, [Op.gte]: min_price };
    }
    
    if (max_price) {
      whereCondition.prix = { ...whereCondition.prix, [Op.lte]: max_price };
    }

    // Construire les options de tri
    let order = [];
    if (sort) {
      switch (sort) {
        case 'price_asc':
          order.push(['prix', 'ASC']);
          break;
        case 'price_desc':
          order.push(['prix', 'DESC']);
          break;
        case 'title_asc':
          order.push(['titre', 'ASC']);
          break;
        case 'title_desc':
          order.push(['titre', 'DESC']);
          break;
        case 'date_asc':
          order.push(['date_ajout', 'ASC']);
          break;
        case 'date_desc':
          order.push(['date_ajout', 'DESC']);
          break;
        default:
          order.push(['date_ajout', 'DESC']);
      }
    } else {
      order.push(['date_ajout', 'DESC']);
    }

    // Récupérer les livres avec pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: livres } = await Livre.findAndCountAll({
      where: whereCondition,
      order,
      limit,
      offset,
      include: [{
        model: Avis,
        attributes: ['note'],
        required: false
      }]
    });

    // Calculer la note moyenne pour chaque livre
    const livresAvecNoteMoyenne = livres.map(livre => {
      const noteMoyenne = livre.Avis && livre.Avis.length > 0
        ? livre.Avis.reduce((sum, avis) => sum + avis.note, 0) / livre.Avis.length
        : 0;
      
      return {
        ...livre.get({ plain: true }),
        note_moyenne: parseFloat(noteMoyenne.toFixed(1)),
        nombre_avis: livre.Avis ? livre.Avis.length : 0
      };
    });

    res.json({
      livres: livresAvecNoteMoyenne,
      page,
      pages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Récupérer un livre par son ID
// @route   GET /api/front/books/:id
// @access  Public
const getBookById = async (req, res) => {
  try {
    const livre = await Livre.findByPk(req.params.id, {
      include: [{
        model: Avis,
        attributes: ['id_avis', 'note', 'commentaire', 'date_avis', 'valide'],
        include: [{
          model: Utilisateur,
          as: 'utilisateur',
          attributes: ['id_utilisateur', 'username', 'nom']
        }]
      }]
    });

    if (!livre) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    res.json(livre);
  } catch (error) {
    console.error('Erreur lors de la récupération du livre:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


// @desc    Ajouter un avis sur un livre
// @route   POST /api/front/books/:id/reviews
// @access  Private
const createBookReview = async (req, res) => {
  try {
    const { note, commentaire } = req.body;
    const livreId = req.params.id;
    const userId = req.user.id_client;

    // Vérifier si le livre existe
    const livre = await Livre.findByPk(livreId);
    if (!livre) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    // Vérifier si l'utilisateur a déjà laissé un avis
    const avisExistant = await Avis.findOne({
      where: {
        id_livre: livreId,
        id_client: userId
      }
    });

    if (avisExistant) {
      return res.status(400).json({ message: 'Vous avez déjà laissé un avis pour ce livre' });
    }

    // Créer l'avis
    const nouvelAvis = await Avis.create({
      id_livre: livreId,
      id_client: userId,
      note,
      commentaire,
      valide: true // Automatiquement validé
    });

    res.status(201).json({
      message: 'Avis ajouté avec succès, en attente de validation',
      avis: nouvelAvis
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'avis:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBookReview
};