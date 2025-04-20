// backend/routes/front/stripeRoutes.js
const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(''); // Remplacez par votre clé secrète
const { Livre } = require('../../models');

// Route pour créer une session de checkout Stripe
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { items, transaction_id } = req.body;
    
    // Vérifier si nous avons des items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Aucun article fourni pour le paiement' });
    }

    // Préparer les items pour Stripe
    const lineItems = await Promise.all(items.map(async (item) => {
      const livre = await Livre.findByPk(item.id_livre);
      
      if (!livre) {
        throw new Error(`Livre avec ID ${item.id_livre} non trouvé`);
      }
      
      if (livre.stock < item.quantity) {
        throw new Error(`Stock insuffisant pour le livre "${livre.titre}"`);
      }
      
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: livre.titre,
            description: `Auteur: ${livre.auteur}`,
            images: livre.image_url ? [livre.image_url.startsWith('http') ? livre.image_url : `${req.protocol}://${req.get('host')}${livre.image_url}`] : []
          },
          unit_amount: Math.round(livre.prix * 100), // Conversion en centimes
        },
        quantity: item.quantity,
      };
    }));

    // Créer une session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      // Inclure le transaction_id dans l'URL de succès
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/success?transaction_id=${transaction_id || ''}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cancel`,
      // Stocker le transaction_id dans les métadonnées
      metadata: {
        transaction_id: transaction_id || ''
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Erreur lors de la création de la session Stripe:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Route pour vérifier le statut d'une transaction par son ID
router.get('/transaction/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Rechercher les sessions avec ce transaction_id dans les métadonnées
    const sessions = await stripe.checkout.sessions.list({
      limit: 10,
    });
    
    // Filtrer les sessions pour trouver celle avec le bon transaction_id
    const matchingSession = sessions.data.find(
      session => session.metadata && session.metadata.transaction_id === id
    );
    
    if (!matchingSession) {
      return res.status(404).json({ message: 'Transaction non trouvée' });
    }
    
    res.json({
      success: true,
      transaction_id: id,
      payment_status: matchingSession.payment_status,
      amount_total: matchingSession.amount_total / 100 // Convertir en euros
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de la transaction:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;