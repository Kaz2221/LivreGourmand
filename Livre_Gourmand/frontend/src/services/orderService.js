// frontend/src/services/orderService.js
import api from './api';

export const orderService = {
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
  
  // Récupérer toutes les commandes de l'utilisateur
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

export default orderService;