import React, { createContext, useState, useEffect, useContext } from 'react';
import { cartService } from '../services/cartService';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cartShake, setCartShake] = useState(false); // Nouvel état pour l'animation de secousse
  const { isAuthenticated } = useContext(AuthContext);

  // Calculer le nombre d'articles total dans le panier
  const calculateItemCount = (cartData) => {
    if (!cartData || !cartData.Livres) {
      setItemCount(0);
      return;
    }

    const count = cartData.Livres.reduce((total, book) => {
      return total + (book.item_panier?.quantite || 0);
    }, 0);

    setItemCount(count);
  };

  // Fonction pour déclencher l'animation de secousse
  const triggerCartShake = () => {
    setCartShake(true);
    setTimeout(() => setCartShake(false), 600); // Réinitialiser après 600ms
  };

  // Charger le panier
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
      setCart(null);
      setItemCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Initialisation au chargement
  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  // Fonctions exposées
  const addToCart = async (id_livre, quantite = 1) => {
    try {
      setLoading(true);
      const response = await cartService.addToCart(id_livre, quantite);
      setCart(response.panier);
      calculateItemCount(response.panier);
      triggerCartShake(); // Déclencher l'animation de secousse
      return response;
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (id_livre, quantite) => {
    try {
      setLoading(true);
      const response = await cartService.updateCartItem(id_livre, quantite);
      setCart(response.panier);
      calculateItemCount(response.panier);
      return response;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du panier:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeCartItem = async (id_livre) => {
    try {
      setLoading(true);
      const response = await cartService.removeCartItem(id_livre);
      setCart(response.panier);
      calculateItemCount(response.panier);
      return response;
    } catch (error) {
      console.error("Erreur lors de la suppression d'un article:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.clearCart();
      setCart(response.panier);
      setItemCount(0);
      return response;
    } catch (error) {
      console.error("Erreur lors du vidage du panier:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = async () => {
    await fetchCart();
    triggerCartShake(); // Déclencher l'animation après le rafraîchissement
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        loading,
        cartShake, // Exposer l'état de l'animation
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
        refreshCart,
        triggerCartShake // Exposer la fonction pour déclencher l'animation
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;