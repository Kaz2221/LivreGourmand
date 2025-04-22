// src/components/AdminRoute.jsx
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Composant pour protéger les routes administratives
 * Vérifie si l'utilisateur est connecté et possède le rôle d'administrateur ou de gestionnaire
 */
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  // Si le chargement est en cours, on affiche un spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Vérifier si l'utilisateur est connecté et est un administrateur ou gestionnaire
  if (!isAuthenticated || (user.type !== 'administrateur' && user.type !== 'gestionnaire')) {
    // Rediriger vers la page de connexion tout en mémorisant la page demandée
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si l'utilisateur est authentifié et a les droits d'admin, afficher le contenu
  return children;
};

export default AdminRoute;