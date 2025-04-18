// src/services/cartService.js
import api from './api';

export const cartService = {
  // Récupérer le panier de l'utilisateur
  getCart: async () => {
    try {
      const response = await api.get('/api/front/cart');
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },
  
  // Ajouter un article au panier
  addToCart: async (id_livre, quantite = 1) => {
    try {
      const response = await api.post('/api/front/cart/items', { id_livre, quantite });
      return response.data;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  },
  
  // Mettre à jour la quantité d'un article
  updateCartItem: async (id_livre, quantite) => {
    try {
      const response = await api.put(`/api/front/cart/items/${id_livre}`, { quantite });
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },
  
  // Supprimer un article du panier
  removeCartItem: async (id_livre) => {
    try {
      const response = await api.delete(`/api/front/cart/items/${id_livre}`);
      return response.data;
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  },
  
  // Vider le panier
  clearCart: async () => {
    try {
      const response = await api.delete('/api/front/cart');
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
};

export default cartService;