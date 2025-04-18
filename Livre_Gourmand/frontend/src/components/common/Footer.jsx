// src/components/common/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaHeart } from 'react-icons/fa';
import { FaBook, FaShoppingBag, FaUserFriends, FaQuestion, FaTruck, FaShieldAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-secondary text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Section Découvrir */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Découvrir</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <FaBook className="mr-2" />
                <Link to="/about" className="hover:text-white/80">Notre histoire</Link>
              </li>
              <li className="flex items-center">
                <FaHeart className="mr-2" />
                <Link to="/bestsellers" className="hover:text-white/80">Best-seller</Link>
              </li>
              <li className="flex items-center">
                <FaUserFriends className="mr-2" />
                <Link to="/contact" className="hover:text-white/80">Nous joindre</Link>
              </li>
            </ul>
          </div>

          {/* Section Aide */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Aide</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <FaQuestion className="mr-2" />
                <Link to="/faq" className="hover:text-white/80">FAQ</Link>
              </li>
              <li className="flex items-center">
                <FaTruck className="mr-2" />
                <Link to="/shipping" className="hover:text-white/80">Shipping</Link>
              </li>
              <li className="flex items-center">
                <FaShieldAlt className="mr-2" />
                <Link to="/privacy" className="hover:text-white/80">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          {/* Section Suivez-nous */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Suivez-nous</h3>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/80">
                <FaFacebook size={24} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/80">
                <FaInstagram size={24} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/80">
                <FaTwitter size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-white/20 my-6"></div>

        {/* Copyright */}
        <div className="text-center text-sm">
          <p>© {new Date().getFullYear()} Livres Gourmands. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;