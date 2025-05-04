// frontend/src/services/orderService.js
import api from './api';

export const orderService = {
  // Récupérer toutes les commandes (pour l'admin)
  getAdminOrders: async (params = {}) => {
    try {
      const response = await api.get('/api/back/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      throw error;
    }
  },
  
  // Récupérer les détails d'une commande (pour l'admin)
  getAdminOrderById: async (orderId) => {
    try {
      const response = await api.get(`/api/back/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching admin order with id ${orderId}:`, error);
      throw error;
    }
  },
  
  // Mettre à jour le statut d'une commande (pour l'admin)
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.put(`/api/back/orders/${orderId}/status`, { statut: status });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },
  
  // Récupérer les commandes de l'utilisateur connecté
  getUserOrders: async () => {
    try {
      const response = await api.get('/api/front/orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },
  
  // Récupérer une commande par son ID
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/api/front/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order with id ${orderId}:`, error);
      throw error;
    }
  },
  
  // Créer une nouvelle commande
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/api/front/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },
  
  // Annuler une commande
  cancelOrder: async (orderId) => {
    try {
      const response = await api.put(`/api/front/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }
};