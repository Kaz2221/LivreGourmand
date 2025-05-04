// frontend/src/components/common/Header.jsx
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSearch, FaSignOutAlt, FaBook, FaList, FaHeart, FaEnvelope, FaTachometerAlt, FaShoppingBag, FaUserCog, FaChartLine } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { motion } from 'framer-motion';

const Header = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const { itemCount, cartShake } = useContext(CartContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  // Vérifier si l'utilisateur est un administrateur ou gestionnaire
  const isAdmin = user && (user.type === 'administrateur' || user.type === 'gestionnaire');

  return (
    <header className="bg-primary text-white sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center p-4">
        <div className="logo">
          <Link to="/" className="text-2xl font-bold">Livres Gourmands</Link>
        </div>

        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-secondary">Accueil</Link>
          <Link to="/shop" className="hover:text-secondary">Boutique</Link>
          <Link to="/wishlist" className="hover:text-secondary flex items-center"><FaHeart className="mr-1" /> Wishlist</Link>
          <Link to="/contact" className="hover:text-secondary flex items-center"><FaEnvelope className="mr-1" /> Contact</Link>
          
          {/* Liens vers le tableau de bord pour les administrateurs */}
          {isAdmin && (
            <div className="relative group">
              <button className="hover:text-secondary flex items-center">
                <FaTachometerAlt className="mr-1" /> Admin <span className="ml-1">▼</span>
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                <Link 
                  to="/admin/dashboard" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FaChartLine className="mr-2" /> Tableau de Bord
                </Link>
                <Link 
                  to="/admin/orders" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FaShoppingBag className="mr-2" /> Gestion Commandes
                </Link>
                <Link 
                  to="/admin/users" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FaUserCog className="mr-2" /> Gestion Utilisateurs
                </Link>
              </div>
            </div>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {/* Barre de recherche */}
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-secondary w-40 md:w-auto"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/80">
              <FaSearch />
            </button>
          </form>

          {/* Icône utilisateur avec menu déroulant */}
          <div className="relative">
            <button 
              className="flex items-center hover:text-secondary"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <FaUser className="text-xl" />
              {isAuthenticated && user && (
                <span className="ml-2 hidden sm:block">{user.username || user.nom}</span>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      Connecté en tant que <span className="font-bold">{user.username || user.nom}</span>
                    </div>
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => setShowDropdown(false)}
                    >
                      <FaUser className="mr-2" /> Mon profil
                    </Link>
                    <Link 
                      to="/my-orders" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => setShowDropdown(false)}
                    >
                      <FaList className="mr-2" /> Mes commandes
                    </Link>
                    <Link 
                      to="/wishlist" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => setShowDropdown(false)}
                    >
                      <FaBook className="mr-2" /> Ma liste de souhaits
                    </Link>
                    
                    {/* Options administrateur */}
                    {isAdmin && (
                      <>
                        <div className="border-t border-gray-100 my-1"></div>
                        <div className="px-4 py-1 text-xs text-gray-500">Administration</div>
                        
                        <Link 
                          to="/admin/dashboard" 
                          className="block px-4 py-2 text-sm text-primary hover:bg-gray-100 flex items-center"
                          onClick={() => setShowDropdown(false)}
                        >
                          <FaChartLine className="mr-2" /> Tableau de Bord
                        </Link>
                        
                        <Link 
                          to="/admin/orders" 
                          className="block px-4 py-2 text-sm text-primary hover:bg-gray-100 flex items-center"
                          onClick={() => setShowDropdown(false)}
                        >
                          <FaShoppingBag className="mr-2" /> Gestion Commandes
                        </Link>
                        
                        <Link 
                          to="/admin/users" 
                          className="block px-4 py-2 text-sm text-primary hover:bg-gray-100 flex items-center"
                          onClick={() => setShowDropdown(false)}
                        >
                          <FaUserCog className="mr-2" /> Gestion Utilisateurs
                        </Link>
                      </>
                    )}
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <FaSignOutAlt className="mr-2" /> Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      Connexion
                    </Link>
                    <Link 
                      to="/register" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      Créer un compte
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Icône panier avec badge et animation */}
          <Link to="/cart" className="hover:text-secondary relative">
            <motion.div
              animate={cartShake ? { x: [0, -5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.6 }}
            >
              <FaShoppingCart className="text-xl" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Navigation mobile */}
      <div className="md:hidden border-t border-white/10">
        <div className="flex flex-wrap justify-around px-4 py-2">
          <Link to="/" className="text-white/80 py-1">Accueil</Link>
          <Link to="/shop" className="text-white/80 py-1">Boutique</Link>
          <Link to="/wishlist" className="text-white/80 py-1">Wishlist</Link>
          <Link to="/contact" className="text-white/80 py-1">Contact</Link>
          {isAdmin && (
            <Link to="/admin/dashboard" className="text-white/80 py-1">Admin</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;