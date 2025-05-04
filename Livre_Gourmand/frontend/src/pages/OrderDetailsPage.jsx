// src/pages/OrderDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSpinner, FaClock, FaCheckCircle, FaTruck, FaBox, FaTimes, FaReceipt, FaBoxOpen } from 'react-icons/fa';
import { orderService } from '../services/orderService';
import { motion } from 'framer-motion';
import ConfirmDialog from '../components/common/ConfirmDialog';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrderById(id);
        setOrder(data);
      } catch (err) {
        console.error('Erreur lors du chargement des détails de la commande:', err);
        setError('Impossible de charger les détails de la commande. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const handleCancelOrder = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancelOrder = async () => {
    try {
      setCancelLoading(true);
      await orderService.cancelOrder(id);
      // Rafraîchir les données de la commande
      const updatedOrder = await orderService.getOrderById(id);
      setOrder(updatedOrder);
      // Ici, vous pourriez afficher une notification de succès si vous avez implémenté le système de notifications
    } catch (err) {
      console.error('Erreur lors de l\'annulation de la commande:', err);
      setError('Impossible d\'annuler la commande. ' + (err.response?.data?.message || 'Veuillez réessayer.'));
    } finally {
      setCancelLoading(false);
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Fonction qui retourne l'icône, la couleur et les informations du statut
  const getStatusInfo = (status) => {
    switch (status) {
      case 'EN_ATTENTE':
        return { 
          icon: <FaClock className="text-2xl" />, 
          color: 'text-yellow-500', 
          bgColor: 'bg-yellow-100',
          label: 'En attente',
          description: 'Votre commande a été reçue et est en attente de validation.'
        };
      case 'VALIDEE':
        return { 
          icon: <FaCheckCircle className="text-2xl" />, 
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          label: 'Validée',
          description: 'Votre commande a été validée et est en cours de préparation.'
        };
      case 'EN_COURS_DE_LIVRAISON':
        return { 
          icon: <FaTruck className="text-2xl" />, 
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          label: 'En cours de livraison',
          description: 'Votre commande est en route vers l\'adresse de livraison indiquée.'
        };
      case 'LIVREE':
        return { 
          icon: <FaBox className="text-2xl" />, 
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          label: 'Livrée',
          description: 'Votre commande a été livrée à l\'adresse indiquée.'
        };
      case 'ANNULEE':
        return { 
          icon: <FaTimes className="text-2xl" />, 
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          label: 'Annulée',
          description: 'Votre commande a été annulée.'
        };
      default:
        return { 
          icon: <FaClock className="text-2xl" />, 
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          label: status,
          description: 'Statut de la commande non reconnu.'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <FaSpinner className="animate-spin text-primary text-4xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || "Commande non trouvée"}
        </div>
        <button 
          onClick={() => navigate('/my-orders')} 
          className="flex items-center text-primary"
        >
          <FaArrowLeft className="mr-2" />
          Retour à mes commandes
        </button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.statut);
  const canCancel = ['EN_ATTENTE', 'VALIDEE'].includes(order.statut);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/my-orders')} 
          className="flex items-center text-primary hover:underline"
        >
          <FaArrowLeft className="mr-2" />
          Retour à mes commandes
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-primary text-white p-6">
          <h1 className="text-2xl font-bold">Détails de la commande #{order.id_commande}</h1>
          <p className="text-white/80">Passée le {formatDate(order.date_commande)}</p>
        </div>

        <div className="p-6">
          <div className={`${statusInfo.bgColor} ${statusInfo.color} p-4 rounded-lg flex items-start mb-6`}>
            <div className="mr-4">{statusInfo.icon}</div>
            <div>
              <h3 className="font-bold text-lg">{statusInfo.label}</h3>
              <p>{statusInfo.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-primary mb-3">Récapitulatif</h2>
              <div className="bg-gray-50 p-4 rounded">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Numéro de commande</span>
                  <span className="font-medium">#{order.id_commande}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">{formatDate(order.date_commande)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Statut</span>
                  <span className={`font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Total</span>
                  <span className="font-medium">{parseFloat(order.montant_total).toFixed(2)} €</span>
                </div>
                {order.transaction_id && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Transaction ID</span>
                    <span className="font-medium">{order.transaction_id}</span>
                  </div>
                )}
              </div>
            </div>

            {order.Paiements && order.Paiements.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-primary mb-3">Paiement</h2>
                <div className="bg-gray-50 p-4 rounded">
                  {order.Paiements.map((paiement) => (
                    <div key={paiement.id_paiement}>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Méthode</span>
                        <span className="font-medium">{paiement.mode_paiement}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Statut</span>
                        <span className="font-medium">{paiement.statut}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Montant</span>
                        <span className="font-medium">{parseFloat(paiement.montant).toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Date</span>
                        <span className="font-medium">{formatDate(paiement.date_paiement)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <h2 className="text-lg font-semibold text-primary mb-3">Articles commandés</h2>
<div className="bg-gray-50 rounded p-4 mb-6">
  {order.Livres && order.Livres.length > 0 ? (
    <div className="space-y-4">
      {order.Livres.map((livre) => (
        <motion.div
          key={livre.id_livre}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-white rounded-lg shadow-sm"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-16 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
            {livre.image_url ? (
              <img
                src={livre.image_url.startsWith('http') ? livre.image_url : `http://localhost:3001${livre.image_url}`}
                alt={livre.titre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <FaBoxOpen size={20} />
              </div>
            )}
          </div>
          <div className="flex-grow">
            <Link to={`/book/${livre.id_livre}`} className="font-medium text-primary hover:underline">
              {livre.titre}
            </Link>
            <div className="text-sm text-gray-600">
              {livre.auteur}
            </div>
          </div>
          <div className="text-right sm:text-left">
            <div className="text-sm text-gray-500">
              Quantité: {livre.ItemCommande?.quantite || 0}
            </div>
            <div className="text-gray-700">
              {parseFloat(livre.ItemCommande?.prix_unitaire || 0).toFixed(2)} € / unité
            </div>
          </div>
          <div className="font-bold text-primary text-right whitespace-nowrap">
            {(parseFloat(livre.ItemCommande?.prix_unitaire || 0) * (livre.ItemCommande?.quantite || 0)).toFixed(2)} €
          </div>
        </motion.div>
      ))}

      {/* Sous-total, frais de livraison, etc. */}
    </div>
  ) : (
    <p className="text-gray-500 italic text-center py-4">Aucun article disponible pour cette commande</p>
  )}
</div>

          <div className="flex justify-between items-center">
            <Link
              to="/shop"
              className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90 transition-colors"
            >
              Continuer mes achats
            </Link>

            {canCancel && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelLoading}
                className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors disabled:bg-red-400"
              >
                {cancelLoading ? 'Annulation...' : 'Annuler la commande'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ajouter le composant de confirmation */}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={confirmCancelOrder}
        title="Annuler la commande"
        message="Êtes-vous sûr de vouloir annuler cette commande ?"
        confirmText="Oui, annuler"
        cancelText="Non, garder"
        type="danger"
      />
    </div>
  );
};

export default OrderDetailsPage;