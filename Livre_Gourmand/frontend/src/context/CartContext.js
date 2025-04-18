// src/context/CartContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { cartService } from '../services/cartService';
import { AuthContext } from './AuthContext';

// Créer un contexte pour le panier
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);

  // Charger le panier au démarrage si l'utilisateur est authentifié
  useEffect(() => {
    const fetchCart = async () => {
      if (!isAuthenticated) {
        setCart(null);
        setItemCount(0);
        return;
      }

      try {
        setLoading(true);
        const data = await cartService.getCart();
        setCart(data);
        calculateItemCount(data);
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [isAuthenticated]);

  // Calculer le nombre total d'articles dans le panier
  const calculateItemCount = (cartData) => {
    if (!cartData || !cartData.Livres) {
      setItemCount(0);
      return;
    }

    const count = cartData.Livres.reduce((total, book) => {
      return total + (book.ItemPanier?.quantite || 0);
    }, 0);

    setItemCount(count);
  };

  // Ajouter un article au panier
  const addToCart = async (id_livre, quantite = 1) => {
    try {
      setLoading(true);
      const response = await cartService.addToCart(id_livre, quantite);
      setCart(response.panier);
      calculateItemCount(response.panier);
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour la quantité d'un article
  const updateCartItem = async (id_livre, quantite) => {
    try {
      setLoading(true);
      const response = await cartService.updateCartItem(id_livre, quantite);
      setCart(response.panier);
      calculateItemCount(response.panier);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du panier:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un article du panier
  const removeCartItem = async (id_livre) => {
    try {
      setLoading(true);
      const response = await cartService.removeCartItem(id_livre);
      setCart(response.panier);
      calculateItemCount(response.panier);
      return response;
    } catch (error) {
      console.error('Erreur lors de la suppression du panier:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Vider le panier
  const clearCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.clearCart();
      setCart(response.panier);
      setItemCount(0);
      return response;
    } catch (error) {
      console.error('Erreur lors de la suppression du panier:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Valeurs exposées par le contexte
  const value = {
    cart,
    itemCount,
    loading,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    refreshCart: async () => {
      try {
        setLoading(true);
        const data = await cartService.getCart();
        setCart(data);
        calculateItemCount(data);
        return data;
      } catch (error) {
        console.error('Erreur lors du rafraîchissement du panier:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;