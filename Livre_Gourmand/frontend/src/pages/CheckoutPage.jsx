import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_ta_cle_publique'); // Remplace avec ta vraie clé publique

const CheckoutPage = () => {
  // Récupération du panier depuis localStorage
  let cartItems = [];
  try {
    const rawItems = localStorage.getItem('cartItems');
    const parsedItems = JSON.parse(rawItems);
    if (Array.isArray(parsedItems)) {
      cartItems = parsedItems;
    }
  } catch (error) {
    console.error("Erreur lors de la lecture du panier:", error);
  }

  // ✅ Calcul du total
  const total = cartItems.reduce((acc, item) => {
    return acc + item.quantity * item.price;
  }, 0).toFixed(2);

  const handleCheckout = async () => {
    const stripe = await stripePromise;
    const response = await fetch('http://localhost:3001/api/front/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cartItems }),
    });

    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Erreur lors de la redirection vers Stripe.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Commande</h1>

      {cartItems.length === 0 ? (
        <p>Votre panier est vide.</p>
      ) : (
        <>
          <ul className="mb-4">
            {cartItems.map((item, index) => (
              <li key={index}>
                {item.title} — {item.quantity} × {item.price} €
              </li>
            ))}
          </ul>

          <div className="text-right font-semibold text-lg mt-4">
            Sous-total : {total} €
          </div>

          <button
            onClick={handleCheckout}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Payer avec Stripe
          </button>
        </>
      )}
    </div>
  );
};

export default CheckoutPage;
