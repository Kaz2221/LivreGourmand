// src/pages/SuccessPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const SuccessPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-6">
      <FaCheckCircle className="text-green-500 text-6xl mb-4" />
      <h1 className="text-3xl font-bold text-green-700 mb-2">Paiement réussi</h1>
      <p className="text-gray-700 mb-6">Merci pour votre commande. Vous recevrez un courriel de confirmation sous peu.</p>
      <Link to="/shop" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
        Retour à la boutique
      </Link>
    </div>
  );
};

export default SuccessPage;
