// src/pages/OrdersHistoryPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaSpinner, FaClock, FaCheckCircle, FaTruck, FaBox, FaTimes } from 'react-icons/fa';
import { orderService } from '../services/orderService';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const OrdersHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useContext(AuthContext);

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

  // Fonction qui retourne l'icône et la couleur en fonction du statut de la commande
  const getStatusInfo = (status) => {
    switch (status) {
      case 'EN_ATTENTE':
        return { icon: <FaClock />, color: 'text-yellow-500', label: 'En attente' };
      case 'VALIDEE':
        return { icon: <FaCheckCircle />, color: 'text-green-500', label: 'Validée' };
      case 'EN_COURS_DE_LIVRAISON':
        return { icon: <FaTruck />, color: 'text-blue-500', label: 'En livraison' };
      case 'LIVREE':
        return { icon: <FaBox />, color: 'text-green-700', label: 'Livrée' };
      case 'ANNULEE':
        return { icon: <FaTimes />, color: 'text-red-500', label: 'Annulée' };
      default:
        return { icon: <FaClock />, color: 'text-gray-500', label: status };
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
        <div className="grid gap-6">
          {orders.map((order, index) => {
            const statusInfo = getStatusInfo(order.statut);
            return (
              <motion.div
                key={order.id_commande}
                className="bg-white rounded-lg shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b">
                  <div>
                    <div className="text-sm text-gray-500">
                      Commande #{order.id_commande} - {formatDate(order.date_commande)}
                    </div>
                    <div className={`flex items-center font-medium ${statusInfo.color}`}>
                      {statusInfo.icon}
                      <span className="ml-2">{statusInfo.label}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {parseFloat(order.montant_total).toFixed(2)} €
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.Livres ? order.Livres.length : 0} article(s)
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4">
                  {order.Livres && order.Livres.length > 0 ? (
                    <div className="space-y-4">
                      {order.Livres.map((livre) => (
                        <div key={livre.id_livre} className="flex items-center gap-4">
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
                            <div className="text-sm text-gray-500">
                              {livre.auteur}
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Quantité: </span>
                              <span>{livre.ItemCommande.quantite}</span>
                              <span className="mx-2">•</span>
                              <span className="text-gray-500">Prix unitaire: </span>
                              <span>{parseFloat(livre.ItemCommande.prix_unitaire).toFixed(2)} €</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Aucun détail disponible</p>
                  )}
                </div>

                <div className="bg-gray-50 px-6 py-3 border-t flex justify-end">
                  <Link 
                    to={`/my-orders/${order.id_commande}`} 
                    className="text-primary hover:underline font-medium"
                  >
                    Voir les détails
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersHistoryPage;