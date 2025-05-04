// Dans OrdersHistoryPage.jsx
// Ajouter un aperçu des articles de la commande

import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaSpinner, FaClock, FaCheckCircle, FaTruck, FaBox, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { orderService } from '../services/orderService';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const OrdersHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useContext(AuthContext);
  // Nouvel état pour suivre quelle commande est développée
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.getUserOrders();
        setOrders(data);
      } catch (err) {
        console.error('Erreur lors du chargement des commandes:', err);
        setError('Impossible de charger vos commandes. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

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

  // Fonction pour basculer l'état développé d'une commande
  const toggleOrderExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null); // Réduire si déjà développé
    } else {
      setExpandedOrder(orderId); // Développer si réduit
    }
  };

  // Fonction qui retourne l'icône, la couleur et les informations du statut
  const getStatusInfo = (status) => {
    switch (status) {
      case 'EN_ATTENTE':
        return { 
          icon: <FaClock />, 
          color: 'text-yellow-500', 
          bgColor: 'bg-yellow-100',
          label: 'En attente'
        };
      case 'VALIDEE':
        return { 
          icon: <FaCheckCircle />, 
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          label: 'Validée'
        };
      case 'EN_COURS_DE_LIVRAISON':
        return { 
          icon: <FaTruck />, 
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          label: 'En livraison'
        };
      case 'LIVREE':
        return { 
          icon: <FaBox />, 
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          label: 'Livrée'
        };
      case 'ANNULEE':
        return { 
          icon: <FaTimes />, 
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          label: 'Annulée'
        };
      default:
        return { 
          icon: <FaClock />, 
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          label: status
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Historique de mes commandes</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FaBoxOpen className="text-gray-300 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Vous n'avez pas encore de commande</h2>
          <p className="text-gray-500 mb-6">Parcourez notre catalogue pour trouver des livres qui vous intéressent.</p>
          <Link to="/shop" className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors">
            Parcourir la boutique
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.statut);
            const isExpanded = expandedOrder === order.id_commande;
            
            return (
              <motion.div
                key={order.id_commande}
                className="bg-white rounded-lg shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleOrderExpand(order.id_commande)}
                >
                  <div>
                    <div className="font-semibold">
                      Commande #{order.id_commande} - {formatDate(order.date_commande)}
                    </div>
                    <div className={`flex items-center mt-1 ${statusInfo.color}`}>
                      {statusInfo.icon}
                      <span className="ml-2">{statusInfo.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-4">
                      <div className="font-bold text-primary">
                        {parseFloat(order.montant_total).toFixed(2)} €
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.Livres ? order.Livres.length : 0} article(s)
                      </div>
                    </div>
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                </div>
                
                {/* Articles de la commande - Visible uniquement si développé */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t pt-3">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Articles commandés</h3>
                    
                    {order.Livres && order.Livres.length > 0 ? (
                      <div className="space-y-2">
                        {order.Livres.map((livre) => (
                          <div key={livre.id_livre} className="flex justify-between items-center py-1 border-b border-gray-100">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-8 h-10 bg-gray-100 rounded overflow-hidden mr-2">
                                {livre.image_url ? (
                                  <img
                                    src={livre.image_url.startsWith('http') ? livre.image_url : `http://localhost:3001${livre.image_url}`}
                                    alt={livre.titre}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <FaBoxOpen size={14} />
                                  </div>
                                )}
                              </div>
                              <span className="text-sm">{livre.titre}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {livre.ItemCommande?.quantite || 1} x {parseFloat(livre.ItemCommande?.prix_unitaire || livre.prix).toFixed(2)} €
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Aucun détail disponible</p>
                    )}
                    
                    <div className="mt-3 text-right">
                      <Link 
                        to={`/my-orders/${order.id_commande}`} 
                        className="text-primary hover:underline text-sm"
                      >
                        Voir les détails complets
                      </Link>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersHistoryPage;