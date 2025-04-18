// src/components/common/AddToCartButton.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart, FaCheck } from "react-icons/fa";
import { cartService } from "../../services/cartService.js";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from '../../context/CartContext';

const AddToCartButton = ({
  livre,
  quantite = 1,
  className = "",
  showQuantity = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(quantite);
  const { isAuthenticated } = useContext(AuthContext);
  const { refreshCart } = useContext(CartContext); //;
  const navigate = useNavigate();

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQty(value);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      setError("");
      setLoading(true);
      await cartService.addToCart(livre.id_livre, qty);
      await refreshCart();
      setSuccess(true);

      // Réinitialiser le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Erreur lors de l'ajout au panier:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(
          "Impossible d'ajouter ce livre au panier. Veuillez réessayer."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${className}`}>
      {showQuantity && (
        <div className="flex items-center mb-3">
          <label htmlFor="quantity" className="mr-2 text-gray-700">
            Quantité:
          </label>
          <input
            type="number"
            id="quantity"
            min="1"
            value={qty}
            onChange={handleQuantityChange}
            className="w-16 border rounded-md px-2 py-1 text-center"
          />
        </div>
      )}

      <button
        onClick={handleAddToCart}
        disabled={loading || success}
        className={`flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
          success
            ? "bg-green-600 text-white"
            : "bg-primary text-white hover:bg-primary/90"
        } disabled:opacity-70 w-full`}
      >
        {loading ? (
          <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
        ) : success ? (
          <FaCheck className="mr-2" />
        ) : (
          <FaShoppingCart className="mr-2" />
        )}

        {success ? "Ajouté au panier" : "Ajouter au panier"}
      </button>

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default AddToCartButton;
