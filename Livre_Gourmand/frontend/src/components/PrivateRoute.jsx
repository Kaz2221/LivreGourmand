// src/components/PrivateRoute.jsx
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  // Si le chargement est en cours, on peut afficher un spinner ou rien
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  // en sauvegardant l'emplacement actuel pour rediriger après la connexion
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si l'utilisateur est authentifié, render les enfants (la route protégée)
  return children;
};

export default PrivateRoute;