import api from './api';

export const authService = {
  // Inscription
  register: async (userData) => {
    try {
      const response = await api.post('/api/front/users/register', userData);
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },
  
  // Connexion
  login: async (email, password) => {
    try {
      const response = await api.post('/api/front/users/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
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
  
  // Mettre à jour le profil de l'utilisateur
  updateUserProfile: async (userData) => {
    try {
      const response = await api.put('/api/front/users/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
};