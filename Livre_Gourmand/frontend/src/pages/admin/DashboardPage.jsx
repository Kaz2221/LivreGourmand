// frontend/src/pages/admin/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMoneyBill, FaShoppingCart, FaChartLine, FaUsers, FaEllipsisV, FaArrowRight } from 'react-icons/fa';
import api from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import RevenueChart from '../../components/admin/RevenueChart';

// Composant de carte pour les statistiques
const StatCard = ({ icon, title, value, trend, trendValue }) => {
  return (
    <div className="bg-primary text-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          {icon}
          <h3 className="ml-2 text-sm font-medium opacity-80">{title}</h3>
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <div className="flex items-center mt-2 text-xs">
        <span className={`${trend === 'up' ? 'text-green-300' : 'text-red-300'}`}>
          {trend === 'up' ? '↑' : '↓'} {trend === 'up' ? '+' : ''}{trendValue}
        </span>
        <span className="ml-1 opacity-70">aujourd'hui</span>
      </div>
    </div>
  );
};

// Composant pour afficher les top catégories
const TopCategories = () => {
  // Données statiques pour le développement
  const demoCategories = [
    { name: 'FRANCAISE', count: 78 },
    { name: 'PATISSERIE', count: 65 },
    { name: 'ITALIENNE', count: 54 },
    { name: 'ASIATIQUE', count: 42 },
    { name: 'VEGETARIENNE', count: 38 }
  ];

  // Convertir le nom de catégorie en format lisible
  const formatCategoryName = (name) => {
    const nameMappings = {
      'FRANCAISE': 'Française',
      'ITALIENNE': 'Italienne',
      'ASIATIQUE': 'Asiatique',
      'VEGETARIENNE': 'Végétarienne',
      'PATISSERIE': 'Pâtisserie',
      'VINS': 'Vins',
      'AUTRE': 'Autre'
    };
    
    return nameMappings[name] || name;
  };

  return (
    <div className="space-y-4">
      {demoCategories.map((category, index) => (
        <div key={index} className="flex items-center">
          <div 
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-3"
          >
            {index + 1}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{formatCategoryName(category.name)}</p>
            <p className="text-xs text-gray-300">#{category.count} vendus</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date range for filtering (par défaut: dernier mois)
  const [dateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date()
  });

  // Formater la date pour l'affichage
  const formatDateRange = () => {
    const formatDate = (date) => {
      return new Intl.DateTimeFormat('fr-FR', { 
        day: '2-digit', 
        month: 'long', // Utilisez 'long' pour le nom complet du mois
        year: 'numeric'
      }).format(date);
    };
    return `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`;
  };

  // Convertir un statut en format lisible avec couleur
  const getStatusLabel = (status) => {
    const statusMap = {
      'EN_ATTENTE': { label: 'En attente', color: 'bg-yellow-200 text-yellow-800' },
      'VALIDEE': { label: 'Validée', color: 'bg-blue-200 text-blue-800' },
      'EN_COURS_DE_LIVRAISON': { label: 'En livraison', color: 'bg-orange-200 text-orange-800' },
      'LIVREE': { label: 'Livrée', color: 'bg-green-200 text-green-800' },
      'ANNULEE': { label: 'Annulée', color: 'bg-red-200 text-red-800' }
    };
    
    return statusMap[status] || { label: status, color: 'bg-gray-200 text-gray-800' };
  };

  // Charger les données du tableau de bord
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les statistiques
        const statsResponse = await api.get('/api/back/dashboard/stats');
        setStats(statsResponse.data);
        
        // Récupérer les données de ventes
        const salesResponse = await api.get('/api/back/dashboard/sales', {
          params: { periode: 'mois' }
        });
        setSalesData(salesResponse.data);
        
        // Récupérer les commandes récentes
        const ordersResponse = await api.get('/api/back/orders', {
          params: { limit: 5, sort: 'date_desc' }
        });
        setRecentOrders(ordersResponse.data.commandes);
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des données du tableau de bord:', err);
        setError('Impossible de charger les données. Veuillez réessayer.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const dashboardContent = loading ? (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  ) : error ? (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {error}
    </div>
  ) : (
    <>
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Tableau de bord</h1>
        <div className="text-sm text-gray-600">
          {formatDateRange()}
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<FaMoneyBill />} 
          title="Revenus" 
          value={`${stats?.ventes?.total ? stats.ventes.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '0 €'}`}
          trend="up" 
          trendValue="10% (+150€)" 
        />
        <StatCard 
          icon={<FaShoppingCart />} 
          title="Commandes" 
          value={stats?.commandes?.total || 0} 
          trend="up" 
          trendValue="10% (+150)" 
        />
        <StatCard 
          icon={<FaChartLine />} 
          title="Profit" 
          value={`${stats?.ventes?.mois ? stats.ventes.mois.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '0 €'}`} 
          trend="up" 
          trendValue="10% (+150€)" 
        />
        <StatCard 
          icon={<FaUsers />} 
          title="Clients" 
          value={stats?.utilisateurs?.total || 0} 
          trend="up" 
          trendValue="10% (+150)" 
        />
      </div>

      {/* Graphique et top catégories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Graphique des revenus mensuels */}
        <div className="lg:col-span-2 bg-primary text-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Revenus</h2>
          <div className="text-sm text-gray-300 mb-2">
            {stats?.ventes?.total ? stats.ventes.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '0 €'} 
            <span className="ml-2 text-green-300">
              {stats?.ventes?.mois && stats?.ventes?.total ? 
                `${((stats.ventes.mois / stats.ventes.total) * 100).toFixed(1)}% du total ce mois-ci` : 
                '0% de croissance'}
            </span>
          </div>
          
          {/* Intégration du composant RevenueChart */}
          <RevenueChart />
        </div>

        {/* Top 5 Catégories */}
        <div className="bg-primary text-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Top 5 Catégories</h2>
          <TopCategories />
        </div>
      </div>

      {/* Tableau des commandes récentes */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-primary">Commandes récentes</h2>
          <Link 
            to="/admin/orders" 
            className="text-primary hover:text-primary/80 flex items-center text-sm font-medium"
          >
            Voir toutes les commandes <FaArrowRight className="ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Commande
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
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(recentOrders) && recentOrders.length > 0 ? (
                recentOrders.map((order) => {
                  const statusInfo = getStatusLabel(order.statut);
                  
                  // Récupérer le nom du client en utilisant la structure correcte
                  let clientName = "Client inconnu";
                  
                  // Utiliser la nouvelle structure clientInfo si disponible
                  if (order.clientInfo && order.clientInfo.nom) {
                    clientName = order.clientInfo.nom;
                  }
                  // Sinon, essayer les anciennes méthodes
                  else if (order.Client && order.Client.Utilisateur) {
                    clientName = order.Client.Utilisateur.nom || order.Client.Utilisateur.username || "Client: " + order.id_client;
                  } 
                  // Fallback final
                  else if (order.id_client) {
                    clientName = "Client ID: " + order.id_client;
                  }
                  
                  return (
                    <tr key={order.id_commande}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id_commande}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.date_commande).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {clientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {parseFloat(order.montant_total).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <Link to={`/admin/orders`} className="text-primary hover:text-primary/80">
                          <FaEllipsisV />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucune commande récente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  return (
    <AdminLayout>
      {dashboardContent}
    </AdminLayout>
  );
};

export default DashboardPage;