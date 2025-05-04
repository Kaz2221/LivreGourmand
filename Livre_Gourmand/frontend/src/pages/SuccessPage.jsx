import React, { useEffect, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { orderService } from '../services/orderService';
import { CartContext } from '../context/CartContext';

const SuccessPage = () => {
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState('');
  const { cart, clearCart } = useContext(CartContext);
  const location = useLocation();

  useEffect(() => {
    // Récupérer l'ID de transaction de l'URL
    const urlParams = new URLSearchParams(location.search);
    const transactionId = urlParams.get('transaction_id');
    
    // Récupérer l'ID de transaction stocké localement
    const storedTransactionId = localStorage.getItem('current_transaction_id');
    
    // Récupérer l'ID de commande déjà créée pour cette transaction
    const orderIdForTransaction = localStorage.getItem(`order_for_transaction_${storedTransactionId}`);
    
    console.log('URL Transaction ID:', transactionId);
    console.log('Stored Transaction ID:', storedTransactionId);
    console.log('Stored Order ID:', orderIdForTransaction);
    
    // Si nous avons déjà traité cette transaction
    if (storedTransactionId && orderIdForTransaction) {
      console.log('Commande déjà créée pour cette transaction, affichage direct');
      setOrderId(parseInt(orderIdForTransaction));
      setLoading(false);
      return;
    }
    
    // Vérifier que l'ID de transaction correspond
    if (!transactionId || transactionId !== storedTransactionId) {
      console.log('ID de transaction invalide ou ne correspond pas');
      setError('ID de transaction invalide');
      setLoading(false);
      return;
    }
    
    const createOrder = async () => {
      try {
        console.log('Création de la commande pour la transaction:', transactionId);
        
        // Récupérer les items du panier ou du localStorage
        let items = [];
        
        if (cart && cart.Livres && cart.Livres.length > 0) {
          items = cart.Livres.map(book => ({
            id_livre: book.id_livre,
            quantity: parseInt(book.item_panier.quantite)
          }));
        } else {
          // Utiliser les données sauvegardées
          const savedItemsString = localStorage.getItem('pendingOrderItems');
          if (!savedItemsString) {
            throw new Error('Aucun article trouvé pour la commande');
          }
          
          const savedItems = JSON.parse(savedItemsString);
          if (!Array.isArray(savedItems) || savedItems.length === 0) {
            throw new Error('Format d\'articles invalide ou panier vide');
          }
          
          items = savedItems.map(item => ({
            id_livre: item.id_livre,
            quantity: parseInt(item.quantity || 1)
          }));
        }
        
        // Créer la commande avec la transaction_id
        const response = await orderService.createOrder({
          items,
          paiement_direct: true,
          transaction_id: transactionId
        });
        
        // Enregistrer l'ID de commande pour cette transaction
        const newOrderId = response.commande.id_commande;
        localStorage.setItem(`order_for_transaction_${transactionId}`, newOrderId.toString());
        
        // Mettre à jour l'UI
        setOrderId(newOrderId);
        
        // Nettoyer les données temporaires du panier
        await clearCart();
        
        // Ne pas supprimer transaction_id tout de suite pour éviter les doublons
        // en cas de rechargement de la page
        localStorage.removeItem('pendingOrderItems');
      } catch (err) {
        console.error('Erreur lors de la création de la commande:', err);
        
        // Si l'erreur contient un message indiquant que la transaction existe déjà
        if (err.response?.data?.commande) {
          // La commande existe déjà, utiliser ses informations
          const existingOrderId = err.response.data.commande.id_commande;
          localStorage.setItem(`order_for_transaction_${transactionId}`, existingOrderId.toString());
          setOrderId(existingOrderId);
          
          // Nettoyer quand même le panier
          await clearCart();
          localStorage.removeItem('pendingOrderItems');
        } else {
          // Pour les autres erreurs
          setError(err.message || 'Une erreur est survenue lors de la création de votre commande');
        }
      } finally {
        setLoading(false);
      }
    };
    
    createOrder();
    
  }, [cart, clearCart, location.search]);

  // Nettoyage définitif à la navigation
  const handleLeaveSuccessPage = () => {
    // Ne pas supprimer l'association transaction-commande
    // pour éviter les doublons lors d'une visite ultérieure
    localStorage.removeItem('current_transaction_id');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-6">
        <FaSpinner className="text-green-500 text-6xl mb-4 animate-spin" />
        <h1 className="text-3xl font-bold text-green-700 mb-2">Finalisation de votre commande...</h1>
        <p className="text-gray-700 mb-6">Nous enregistrons votre commande, veuillez patienter.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50 p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <p className="mb-6">Une erreur est survenue lors du traitement de votre commande. Votre paiement a peut-être été traité. Veuillez vérifier dans vos commandes ou contacter notre service client.</p>
        <Link to="/shop" onClick={handleLeaveSuccessPage} className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-6">
      <FaCheckCircle className="text-green-500 text-6xl mb-4" />
      <h1 className="text-3xl font-bold text-green-700 mb-2">Commande confirmée !</h1>
      <p className="text-gray-700 mb-2">Merci pour votre achat. Votre commande a été enregistrée avec succès.</p>
      
      {orderId && (
        <p className="text-gray-700 mb-6">
          Numéro de commande: <span className="font-bold">{orderId}</span>
        </p>
      )}
      
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Un e-mail de confirmation a été envoyé à votre adresse. Vous recevrez un autre e-mail lorsque votre commande sera expédiée.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/shop" onClick={handleLeaveSuccessPage} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
          Continuer mes achats
        </Link>
        
        {orderId && (
          <Link to={`/my-orders/${orderId}`} onClick={handleLeaveSuccessPage} className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90">
            Voir ma commande
          </Link>
        )}
      </div>
    </div>
  );
};

export default SuccessPage;