// src/components/common/WishlistButton.jsx
import React, { useState, useEffect, useContext } from 'react';
import { FaHeart } from 'react-icons/fa';
import { wishlistService } from '../../services/wishlistService';
import { AuthContext } from '../../context/AuthContext';

const WishlistButton = ({ idLivre, quantite = 1 }) => {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [wishlistId, setWishlistId] = useState(null);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const listes = await wishlistService.getAll();
        if (listes.length > 0) {
          setWishlistId(listes[0].id_liste_cadeaux);
        } else {
          // Créer une wishlist par défaut
          const res = await wishlistService.create("Ma wishlist");
          setWishlistId(res.liste.id_liste_cadeaux);
        }
      } catch (err) {
        console.error("Erreur récupération/initialisation wishlist :", err);
      }
    };

    if (isAuthenticated) fetchWishlist();
  }, [isAuthenticated]);

  const handleAdd = async () => {
    if (!wishlistId || !isAuthenticated) return;
    try {
      setLoading(true);
      await wishlistService.addItem(wishlistId, idLivre, quantite);
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch (err) {
      console.error('Erreur ajout wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAdd}
      disabled={loading || added || !wishlistId}
      className={`text-red-500 text-xl hover:scale-110 transition-transform ${added ? 'opacity-60' : ''}`}
      title="Ajouter à la wishlist"
    >
      <FaHeart />
    </button>
  );
};

export default WishlistButton;
