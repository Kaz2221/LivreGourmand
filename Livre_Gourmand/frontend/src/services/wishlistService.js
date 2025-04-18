// frontend/src/services/wishlistService.js
import api from './api';

export const wishlistService = {
  getAll: async () => {
    const res = await api.get('/api/front/wishlists');
    return res.data;
  },

  create: async (nom_liste, date_expiration = null) => {
    const res = await api.post('/api/front/wishlists', { nom_liste, date_expiration });
    return res.data;
  },

  getOne: async (id) => {
    const res = await api.get(`/api/front/wishlists/${id}`);
    return res.data;
  },

  addItem: async (id_liste_cadeaux, id_livre, quantite = 1) => {
    const res = await api.post(`/api/front/wishlists/${id_liste_cadeaux}/items`, { id_livre, quantite });
    return res.data;
  },

  updateItem: async (id_liste_cadeaux, id_livre, quantite) => {
    const res = await api.put(`/api/front/wishlists/${id_liste_cadeaux}/items/${id_livre}`, { quantite });
    return res.data;
  },

  removeItem: async (id_liste_cadeaux, id_livre) => {
    const res = await api.delete(`/api/front/wishlists/${id_liste_cadeaux}/items/${id_livre}`);
    return res.data;
  },

  accessByCode: async (code) => {
    const res = await api.get(`/api/front/wishlists/access/${code}`);
    return res.data;
  },

  purchaseItem: async (code, id_livre) => {
    const res = await api.put(`/api/front/wishlists/access/${code}/items/${id_livre}/purchase`);
    return res.data;
  }
};
