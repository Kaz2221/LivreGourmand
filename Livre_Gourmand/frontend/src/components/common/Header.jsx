import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaUser, FaShoppingCart } from 'react-icons/fa';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  // Récupérer les infos utilisateur du localStorage
  const userInfo = localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null;
  
  const cartItems = localStorage.getItem('cartItems')
    ? JSON.parse(localStorage.getItem('cartItems'))
    : [];
    
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search/${searchTerm}`);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  return (
    <header className="bg-[#4A4A5C] text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Livres Gourmand" 
                className="h-10 w-10 mr-2"
              />
              <span className="font-bold text-xl">Livres gourmand</span>
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-[#B39B84]">Home</Link>
            <Link to="/shop" className="hover:text-[#B39B84]">Shop</Link>
            <Link to="/categories" className="hover:text-[#B39B84]">Categories</Link>
            <Link to="/wishlist" className="hover:text-[#B39B84]">Wishlist</Link>
            <Link to="/reviews" className="hover:text-[#B39B84]">Reviews</Link>
            <Link to="/contact" className="hover:text-[#B39B84]">Contact</Link>
          </nav>
          
          {/* Search, User and Cart */}
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search cookbooks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white text-gray-800 px-4 py-1 pr-10 rounded-full text-sm focus:outline-none"
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <FaSearch />
              </button>
            </form>
            
            <div className="relative cursor-pointer">
              {userInfo ? (
                <div className="relative group">
                  <FaUser className="text-xl" />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white text-gray-800 rounded shadow-lg py-2 z-10 hidden group-hover:block">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="font-semibold">{userInfo.nom}</p>
                      <p className="text-xs text-gray-500">{userInfo.email}</p>
                    </div>
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link>
                    <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100">My Orders</Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login">
                  <FaUser className="text-xl" />
                </Link>
              )}
            </div>
            
            <Link to="/cart" className="relative">
              <FaShoppingCart className="text-xl" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#B39B84] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;