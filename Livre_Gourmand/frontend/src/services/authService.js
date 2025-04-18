// frontend/src/services/authService.js
import api from './api';

// Gestion du localStorage pour persister la session
const TOKEN_KEY = 'userToken';
const USER_INFO = 'userInfo';

export const authService = {
  // Inscription d'un nouvel utilisateur
  register: async (userData) => {
    try {
      const response = await api.post('/api/front/users/register', userData);
      if (response.data && response.data.token) {
        // Stocker le token et les infos utilisateur
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_INFO, JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },
  
  // Connexion utilisateur
  login: async (email, password) => {
    try {
      const response = await api.post('/api/front/users/login', { email, password });
      if (response.data && response.data.token) {
        // Stocker le token et les infos utilisateur
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_INFO, JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },
  
  // Déconnexion
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_INFO);
  },
  
  // Récupérer le profil de l'utilisateur
  getUserProfile: async () => {
    try {
      const response = await api.get('/api/front/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
  
  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return localStorage.getItem(TOKEN_KEY) !== null;
  },
  
  // Récupérer les informations de l'utilisateur connecté
  getCurrentUser: () => {
    const userInfo = localStorage.getItem(USER_INFO);
    return userInfo ? JSON.parse(userInfo) : null;
  },
  
  updateUserProfile: async (userData) => {
    try {
      const response = await api.put('/api/front/users/profile', userData);
      
      // Mettre à jour les informations dans le localStorage
      if (response.data) {
        const currentUser = JSON.parse(localStorage.getItem(USER_INFO)) || {};
        const updatedUser = { ...currentUser, ...response.data };
        localStorage.setItem(USER_INFO, JSON.stringify(updatedUser));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },
  
  // Récupérer le token
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  }
};

export default authService;