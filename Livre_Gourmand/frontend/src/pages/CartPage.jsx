// src/pages/CartPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaShoppingBag, FaArrowLeft } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { cartService } from '../services/cartService';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const data = await cartService.getCart();
        setCart(data);
      } catch (err) {
        console.error('Erreur lors du chargement du panier:', err);
        setError('Impossible de charger votre panier. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  const handleQuantityChange = async (bookId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setLoading(true);
      await cartService.updateCartItem(bookId, newQuantity);
      // Rafraîchir le panier
      const updatedCart = await cartService.getCart();
      setCart(updatedCart);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la quantité:', err);
      setError('Impossible de mettre à jour la quantité. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (bookId) => {
    try {
      setLoading(true);
      await cartService.removeCartItem(bookId);
      // Rafraîchir le panier
      const updatedCart = await cartService.getCart();
      setCart(updatedCart);
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'article:', err);
      setError('Impossible de supprimer l\'article. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  // Calculer le total du panier
  const calculateTotal = () => {
    if (!cart || !cart.Livres || cart.Livres.length === 0) return 0;
    
    return cart.Livres.reduce((total, book) => {
      const price = parseFloat(book.ItemPanier?.prix_unitaire || book.prix);
      const quantity = book.ItemPanier?.quantite || 1;
      return total + (price * quantity);
    }, 0).toFixed(2);
  };

  if (loading && !cart) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-primary mb-6">Mon Panier</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {(!cart || !cart.Livres || cart.Livres.length === 0) ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FaShoppingBag className="text-gray-300 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Votre panier est vide</h2>
            <p className="text-gray-500 mb-6">Parcourez notre catalogue et ajoutez des livres à votre panier.</p>
            <Link 
              to="/shop" 
              className="bg-primary text-white px-6 py-2 rounded-md inline-flex items-center"
            >
              <FaArrowLeft className="mr-2" /> Continuer mes achats
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Articles du panier */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Livre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cart.Livres.map(book => {
                      const price = parseFloat(book.ItemPanier?.prix_unitaire || book.prix);
                      const quantity = book.ItemPanier?.quantite || 1;
                      const itemTotal = (price * quantity).toFixed(2);
                      
                      return (
                        <tr key={book.id_livre}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-20 w-16 flex-shrink-0 bg-gray-200 overflow-hidden rounded">
                                {book.image_url ? (
                                  <img 
                                    src={book.image_url.startsWith('http') 
                                      ? book.image_url 
                                      : `http://localhost:3001${book.image_url}`}
                                    alt={book.titre}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <span className="text-gray-500">Image</span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <Link to={`/book/${book.id_livre}`} className="text-primary font-medium hover:underline">
                                  {book.titre}
                                </Link>
                                <div className="text-gray-500">{book.auteur}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {price.toFixed(2)} €
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center border rounded-md w-28">
                              <button 
                                onClick={() => handleQuantityChange(book.id_livre, quantity - 1)}
                                disabled={quantity <= 1}
                                className="px-2 py-1 text-gray-600 hover:text-primary disabled:text-gray-300"
                              >
                                <FaMinus />
                              </button>
                              <span className="mx-2 w-8 text-center">{quantity}</span>
                              <button 
                                onClick={() => handleQuantityChange(book.id_livre, quantity + 1)}
                                className="px-2 py-1 text-gray-600 hover:text-primary"
                              >
                                <FaPlus />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {itemTotal} €
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => handleRemoveItem(book.id_livre)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Récapitulatif */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Récapitulatif</h2>
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="text-gray-800 font-medium">{calculateTotal()} €</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Frais de livraison</span>
                    <span className="text-gray-800 font-medium">5.00 €</span>
                  </div>
                  <div className="border-t mt-4 pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg text-primary font-semibold">{(parseFloat(calculateTotal()) + 5).toFixed(2)} €</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="mt-6 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Procéder au paiement
                  </button>
                  <Link
                    to="/shop"
                    className="mt-4 w-full block text-center text-primary hover:underline"
                  >
                    Continuer mes achats
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;