import api from './api';

export const bookService = {
  // Obtenir tous les livres
  getBooks: async (params = {}) => {
    try {
      const response = await api.get('/api/front/books', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  },
  
  // Obtenir un livre par son ID
  getBookById: async (id) => {
    try {
      const response = await api.get(`/api/front/books/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching book with id ${id}:`, error);
      throw error;
    }
  },
  
  
  getRecentBooks: async (limit = 4) => {
    try {
      // La requête trie par date d'ajout décroissante
      const response = await api.get('/api/front/books', { 
        params: {
          sort: 'date_desc', 
          limit: limit
        }
      });
      return response.data.livres;
    } catch (error) {
      console.error('Error fetching recent books:', error);
      throw error;
    }
  },

  // Rechercher des livres
  searchBooks: async (searchTerm) => {
    try {
      const response = await api.get(`/api/front/books?search=${searchTerm}`);
      return response.data;
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  },
  
  // Ajouter un avis sur un livre
  addReview: async (bookId, reviewData) => {
    try {
      const response = await api.post(`/api/front/books/${bookId}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }
};