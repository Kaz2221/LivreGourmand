// frontend/src/pages/CheckoutPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingBag, FaCreditCard, FaSpinner } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import axios from 'axios'; // Importer axios directement

const CheckoutPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useContext(AuthContext);
  const { cart, itemCount } = useContext(CartContext);
  const navigate = useNavigate();
  
  // Pour les informations d'expédition
  const [shippingInfo, setShippingInfo] = useState({
    name: user?.nom || '',
    address: user?.adresse || '',
    email: user?.email || ''
  });

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    }
    
    // Si le panier est vide, rediriger vers la page du panier
    if (itemCount === 0) {
      navigate('/cart');
    }
  }, [isAuthenticated, itemCount, navigate]);

  // Préparer les articles pour Stripe
  const prepareCartItems = () => {
    if (!cart || !cart.Livres || cart.Livres.length === 0) return [];
    
    return cart.Livres.map(book => ({
      id_livre: book.id_livre,
      quantity: book.item_panier.quantite,
      price: parseFloat(book.item_panier.prix_unitaire),
      title: book.titre
    }));
  };

  const calculateTotal = () => {
    if (!cart || !cart.Livres || cart.Livres.length === 0) return 0;
    
    return cart.Livres.reduce((total, book) => {
      const price = parseFloat(book.item_panier.prix_unitaire);
      const quantity = book.item_panier.quantite;
      return total + (price * quantity);
    }, 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const items = prepareCartItems();
      
      // Vérifier que nous avons des articles à commander
      if (items.length === 0) {
        setError('Votre panier est vide.');
        setLoading(false);
        return;
      }
      
      // Générer un ID de transaction unique
      const transactionId = `tx_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      
      // Sauvegarder les items et l'ID de transaction pour la page de succès
      localStorage.setItem('pendingOrderItems', JSON.stringify(items));
      localStorage.setItem('current_transaction_id', transactionId);
      
      // Créer une session Stripe simplifiée en utilisant axios directement
      const response = await axios.post('http://localhost:3001/api/front/stripe/create-checkout-session', {
        items,
        transaction_id: transactionId
      });
      
      // Rediriger vers la page de paiement Stripe
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        setError('Impossible de rediriger vers la page de paiement.');
      }
    } catch (err) {
      console.error('Erreur lors de la création de la session de paiement:', err);
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la création de la session de paiement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart) {
    return (
      <div className="container mx-auto p-4 text-center">
        <FaSpinner className="animate-spin inline-block text-4xl text-primary" />
        <p className="mt-4">Chargement de votre panier...</p>
      </div>
    );
  }

  const subtotal = calculateTotal();
  const shippingCost = 5.00; // Frais de livraison fixes
  const total = subtotal + shippingCost;

  return (
    <div className="bg-background py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-primary mb-8">Finaliser votre commande</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Formulaire d'expédition */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-primary mb-4">Informations de livraison</h2>
              
              <form onSubmit={handleCheckout}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 mb-2">Nom complet</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={shippingInfo.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="address" className="block text-gray-700 mb-2">Adresse de livraison</label>
                  <textarea
                    id="address"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 mb-2">Email de contact</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full bg-primary text-white py-3 px-4 rounded-md flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" /> Traitement en cours...
                    </>
                  ) : (
                    <>
                      <FaCreditCard className="mr-2" /> Procéder au paiement
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
          
          {/* Récapitulatif de commande */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-primary mb-4">Récapitulatif de votre commande</h2>
              
              {cart.Livres && cart.Livres.length > 0 ? (
                <div>
                  <div className="max-h-60 overflow-y-auto mb-4">
                    {cart.Livres.map(book => (
                      <div key={book.id_livre} className="flex justify-between items-center py-3 border-b">
                        <div className="flex items-center">
                          <div className="h-16 w-12 bg-gray-200 rounded overflow-hidden mr-3">
                            {book.image_url ? (
                              <img
                                src={book.image_url.startsWith('http') ? book.image_url : `http://localhost:3001${book.image_url}`}
                                alt={book.titre}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <FaShoppingBag className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{book.titre}</p>
                            <p className="text-sm text-gray-500">
                              {book.item_panier.quantite} x {parseFloat(book.item_panier.prix_unitaire).toFixed(2)} €
                            </p>
                          </div>
                        </div>
                        <div className="font-medium">
                          {(book.item_panier.quantite * parseFloat(book.item_panier.prix_unitaire)).toFixed(2)} €
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Sous-total</span>
                      <span>{subtotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Frais de livraison</span>
                      <span>{shippingCost.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span className="text-primary">{total.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaShoppingBag className="mx-auto text-4xl text-gray-300 mb-4" />
                  <p className="text-gray-500">Votre panier est vide</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;