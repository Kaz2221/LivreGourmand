// frontend/src/components/admin/AdminSidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaChartLine, 
  FaShoppingBag, 
  FaUsers, 
  FaBook, 
  FaComments, 
  FaCog, 
  FaSignOutAlt,
  FaAngleDown,
  FaAngleUp,
  FaTachometerAlt,
  FaBars
} from 'react-icons/fa';

const AdminSidebar = ({ onLogout }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState({
    orders: false,
    products: false,
    users: false,
  });

  // Vérifier si le lien est actif
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Toggles pour les sous-menus
  const toggleSubMenu = (menu) => {
    setMenuOpen(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  // Classe commune pour les liens
  const linkClass = "flex items-center py-3 px-4 text-gray-100 hover:bg-primary-dark transition-colors rounded-md";
  const activeLinkClass = "flex items-center py-3 px-4 bg-primary-dark text-white font-medium rounded-md";

  return (
    <div className={`min-h-screen bg-primary text-white ${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 flex flex-col`}>
      {/* En-tête */}
      <div className="p-4 flex justify-between items-center border-b border-white/10">
        {!collapsed && (
          <h2 className="text-xl font-bold">Admin Panel</h2>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-2 rounded-md hover:bg-primary-dark"
        >
          <FaBars />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Dashboard */}
        <Link 
          to="/admin/dashboard" 
          className={isActive('/admin/dashboard') ? activeLinkClass : linkClass}
        >
          <FaTachometerAlt className="mr-3" />
          {!collapsed && "Tableau de Bord"}
        </Link>

        {/* Commandes */}
        <div>
          <button 
            onClick={() => toggleSubMenu('orders')}
            className={`w-full text-left ${linkClass} ${
              isActive('/admin/orders') ? 'bg-primary-dark' : ''
            }`}
          >
            <FaShoppingBag className="mr-3" />
            {!collapsed && (
              <>
                <span className="flex-1">Commandes</span>
                {menuOpen.orders ? <FaAngleUp /> : <FaAngleDown />}
              </>
            )}
          </button>
          
          {!collapsed && menuOpen.orders && (
            <div className="ml-8 mt-1 space-y-1">
              <Link 
                to="/admin/orders" 
                className={isActive('/admin/orders') ? "text-white font-medium" : "text-gray-300 hover:text-white"}
              >
                Toutes les commandes
              </Link>
              <Link 
                to="/admin/orders?status=EN_ATTENTE" 
                className="text-gray-300 hover:text-white"
              >
                En attente
              </Link>
              <Link 
                to="/admin/orders?status=VALIDEE" 
                className="text-gray-300 hover:text-white"
              >
                Validées
              </Link>
            </div>
          )}
        </div>

        {/* Produits */}
        <div>
          <button 
            onClick={() => toggleSubMenu('products')}
            className={`w-full text-left ${linkClass}`}
          >
            <FaBook className="mr-3" />
            {!collapsed && (
              <>
                <span className="flex-1">Livres</span>
                {menuOpen.products ? <FaAngleUp /> : <FaAngleDown />}
              </>
            )}
          </button>
          
          {!collapsed && menuOpen.products && (
            <div className="ml-8 mt-1 space-y-1">
              <Link 
                to="/admin/books" 
                className="text-gray-300 hover:text-white"
              >
                Tous les livres
              </Link>
              <Link 
                to="/admin/books/add" 
                className="text-gray-300 hover:text-white"
              >
                Ajouter un livre
              </Link>
              <Link 
                to="/admin/categories" 
                className="text-gray-300 hover:text-white"
              >
                Catégories
              </Link>
            </div>
          )}
        </div>

        {/* Utilisateurs */}
        <div>
          <button 
            onClick={() => toggleSubMenu('users')}
            className={`w-full text-left ${linkClass}`}
          >
            <FaUsers className="mr-3" />
            {!collapsed && (
              <>
                <span className="flex-1">Utilisateurs</span>
                {menuOpen.users ? <FaAngleUp /> : <FaAngleDown />}
              </>
            )}
          </button>
          
          {!collapsed && menuOpen.users && (
            <div className="ml-8 mt-1 space-y-1">
              <Link 
                to="/admin/users" 
                className="text-gray-300 hover:text-white"
              >
                Tous les utilisateurs
              </Link>
              <Link 
                to="/admin/users/admins" 
                className="text-gray-300 hover:text-white"
              >
                Administrateurs
              </Link>
              <Link 
                to="/admin/users/clients" 
                className="text-gray-300 hover:text-white"
              >
                Clients
              </Link>
            </div>
          )}
        </div>

        {/* Commentaires */}
        <Link 
          to="/admin/reviews" 
          className={isActive('/admin/reviews') ? activeLinkClass : linkClass}
        >
          <FaComments className="mr-3" />
          {!collapsed && "Commentaires"}
        </Link>

        {/* Paramètres */}
        <Link 
          to="/admin/settings" 
          className={isActive('/admin/settings') ? activeLinkClass : linkClass}
        >
          <FaCog className="mr-3" />
          {!collapsed && "Paramètres"}
        </Link>
      </nav>

      {/* Pied de page - Déconnexion */}
      <div className="p-4 border-t border-white/10">
        <button 
          onClick={onLogout}
          className={`${linkClass} w-full text-left text-red-300 hover:text-red-100`}
        >
          <FaSignOutAlt className="mr-3" />
          {!collapsed && "Déconnexion"}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;