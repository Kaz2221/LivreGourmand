// src/pages/CancelPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';

const CancelPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-6">
      <FaTimesCircle className="text-red-500 text-6xl mb-4" />
      <h1 className="text-3xl font-bold text-red-700 mb-2">Paiement annulé</h1>
      <p className="text-gray-700 mb-6">Votre paiement a été annulé. Vous pouvez réessayer à tout moment.</p>
      <Link to="/cart" className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">
        Retour au panier
      </Link>
    </div>
  );
};

export default CancelPage;
