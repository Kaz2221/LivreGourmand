import React, { useState, useEffect } from 'react';
import { FaEdit, FaEye, FaSpinner, FaCheckCircle, FaTruck, FaBox, FaTimesCircle, FaEllipsisV } from 'react-icons/fa';
import api from '../../services/api';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Statuts possibles pour les commandes
  const orderStatuses = [
    { value: 'EN_ATTENTE', label: 'En attente', icon: <FaSpinner className="mr-2" />, color: 'bg-yellow-200 text-yellow-800' },
    { value: 'VALIDEE', label: 'Validée', icon: <FaCheckCircle className="mr-2" />, color: 'bg-blue-200 text-blue-800' },
    { value: 'EN_COURS_DE_LIVRAISON', label: 'En livraison', icon: <FaTruck className="mr-2" />, color: 'bg-orange-200 text-orange-800' },
    { value: 'LIVREE', label: 'Livrée', icon: <FaBox className="mr-2" />, color: 'bg-green-200 text-green-800' },
    { value: 'ANNULEE', label: 'Annulée', icon: <FaTimesCircle className="mr-2" />, color: 'bg-red-200 text-red-800' }
  ];

  // Chargement des commandes depuis l'API
  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Paramètres pour la requête API
      const params = {
        page: currentPage,
        limit: 10
      };
      
      // Ajouter le filtre de statut si présent
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      const response = await api.get('/api/back/orders', { params });
      
      setOrders(response.data.commandes);
      setTotalPages(response.data.pages);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement des commandes:', err);
      setError('Impossible de charger les commandes');
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour le statut d'une commande
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/api/back/orders/${orderId}/status`, { statut: newStatus });
      
      // Mettre à jour l'état local pour refléter le changement
      setOrders(orders.map(order => 
        order.id_commande === orderId 
          ? { ...order, statut: newStatus } 
          : order
      ));
      
      setShowStatusModal(false);
      // Optionnel : Afficher un message de succès
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      setError('Impossible de mettre à jour le statut de la commande');
    }
  };

  // Ouvrir le modal pour changer le statut
  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  // Obtenir le statut formaté avec couleur et icône
  const getStatusInfo = (status) => {
    const statusInfo = orderStatuses.find(s => s.value === status);
    return statusInfo || { 
      label: status, 
      icon: <FaSpinner className="mr-2" />, 
      color: 'bg-gray-200 text-gray-800' 
    };
  };

  // Formatage de la date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Rendu des liens de pagination
  const renderPagination = () => {
    const pageNumbers = [];
    
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 mx-1 rounded ${
            currentPage === i 
              ? 'bg-primary text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }
    
    return (
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 mx-1 rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Précédent
        </button>
        
        {pageNumbers}
        
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 mx-1 rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    );
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold text-primary">Gestion des commandes</h2>
        
        {/* Filtre par statut */}
        <div className="flex items-center">
          <label htmlFor="statusFilter" className="mr-2 text-sm text-gray-600">Filtrer par statut:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="">Tous</option>
            {orderStatuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
          {error}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length > 0 ? (
              orders.map((order) => {
                const statusInfo = getStatusInfo(order.statut);
                
                // Récupérer le nom du client
                let clientName = "Client inconnu";
                
                // Utiliser la structure correcte selon les données disponibles
                if (order.clientInfo && order.clientInfo.nom) {
                  clientName = order.clientInfo.nom;
                } else if (order.Client && order.Client.Utilisateur) {
                  clientName = order.Client.Utilisateur.nom || order.Client.Utilisateur.username || `Client: ${order.id_client}`;
                } else if (order.id_client) {
                  clientName = `Client ID: ${order.id_client}`;
                }
                
                return (
                  <tr key={order.id_commande}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id_commande}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.date_commande)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.color} flex items-center w-fit`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {parseFloat(order.montant_total).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => openStatusModal(order)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Modifier le statut"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-800"
                          title="Voir les détails"
                        >
                          <FaEye />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  Aucune commande trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {orders.length > 0 && renderPagination()}
      
      {/* Modal pour changer le statut */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Modifier le statut de la commande #{selectedOrder.id_commande}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Statut actuel: <span className={`px-2 py-1 text-xs rounded-full ${getStatusInfo(selectedOrder.statut).color} inline-flex items-center`}>
                {getStatusInfo(selectedOrder.statut).icon} {getStatusInfo(selectedOrder.statut).label}
              </span>
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau statut:
              </label>
              <div className="space-y-2">
                {orderStatuses.map(status => (
                  <button
                    key={status.value}
                    onClick={() => updateOrderStatus(selectedOrder.id_commande, status.value)}
                    className={`w-full text-left px-3 py-2 rounded flex items-center ${
                      status.value === selectedOrder.statut 
                        ? 'bg-gray-100 cursor-not-allowed' 
                        : 'hover:bg-gray-100'
                    }`}
                    disabled={status.value === selectedOrder.statut}
                  >
                    {status.icon} {status.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowStatusModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;