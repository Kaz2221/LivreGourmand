import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSearch } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="bg-primary text-white">
      <div className="container mx-auto flex justify-between items-center p-4">
        <div className="logo">
          <Link to="/" className="text-2xl font-bold">Livres Gourmands</Link>
        </div>
        
        <nav className="flex space-x-6">
          <Link to="/" className="hover:text-secondary">Accueil</Link>
          <Link to="/shop" className="hover:text-secondary">Boutique</Link>
          <Link to="/categories" className="hover:text-secondary">Catégories</Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="bg-white text-gray-800 px-3 py-1 rounded-full"
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
          
          <Link to="/login" className="hover:text-secondary">
            <FaUser className="text-xl" />
          </Link>
          
          <Link to="/cart" className="hover:text-secondary">
            <FaShoppingCart className="text-xl" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;