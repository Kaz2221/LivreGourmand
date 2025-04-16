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
  
  // Obtenir les livres mis en avant
  getFeaturedBooks: async () => {
    try {
      // Pour le développement, utilisons des données statiques
      // En production, vous remplaceriez ceci par un vrai appel API
      return [
        {
          id: 1,
          title: "Traditional French Kitchen",
          author: "Marie Dupont",
          price: 29.99,
          image_url: "/books/french-kitchen.jpg"
        },
        {
          id: 2,
          title: "Pasta Classics",
          author: "Giovanni Rossi",
          price: 24.95,
          image_url: "/books/pasta-classics.jpg"
        },
        {
          id: 3,
          title: "Sweet Pastry Mastery",
          author: "Claire Martin",
          price: 34.99,
          image_url: "/books/pastry-mastery.jpg"
        },
        {
          id: 4,
          title: "Farm-to-Table Practices",
          author: "Thomas Green",
          price: 39.95,
          image_url: "/books/farm-to-table.jpg"
        }
      ];
    } catch (error) {
      console.error('Error fetching featured books:', error);
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