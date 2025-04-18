// src/pages/WishlistPage.jsx
import React, { useEffect, useState } from 'react';
import { wishlistService } from '../services/wishlistService';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await wishlistService.getAll();
        setWishlist(data[0] || null); // suppose une seule wishlist
      } catch (err) {
        console.error(err);
        setError("Impossible de charger la liste.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateQuantity = async (id_livre, newQty) => {
    try {
      await wishlistService.updateItem(wishlist.id_liste_cadeaux, id_livre, newQty);
      // Rafraîchir la liste
      const updated = await wishlistService.getOne(wishlist.id_liste_cadeaux);
      setWishlist(updated);
    } catch (err) {
      console.error('Erreur update:', err);
    }
  };

  const handleRemove = async (id_livre) => {
    try {
      const updated = await wishlistService.removeItem(wishlist.id_liste_cadeaux, id_livre);
      setWishlist(updated.liste);
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  if (loading) return <p className="text-center py-10">Chargement...</p>;
  if (error) return <p className="text-red-500 text-center py-10">{error}</p>;
  if (!wishlist || wishlist.livres.length === 0) return <p className="text-center py-10">Votre liste est vide.</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-primary mb-6">Ma liste de souhaits</h1>
      <div className="grid gap-4">
        {wishlist.livres.map((livre) => {
          const quantite = livre.ItemListeCadeaux?.quantite ?? 1;
          return (
            <div key={livre.id_livre} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={livre.image_url?.startsWith('http') ? livre.image_url : `http://localhost:3001${livre.image_url}`}
                  alt={livre.titre}
                  className="w-16 h-20 object-cover rounded"
                />
                <div>
                  <h2 className="font-semibold text-lg text-primary">{livre.titre}</h2>
                  <p className="text-sm text-gray-600">{livre.auteur}</p>
                  <p className="text-sm text-gray-800">{livre.prix} €</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleUpdateQuantity(livre.id_livre, Math.max(1, quantite - 1))}
                  className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  <FaMinus />
                </button>
                <span className="px-3">{quantite}</span>
                <button
                  onClick={() => handleUpdateQuantity(livre.id_livre, quantite + 1)}
                  className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  <FaPlus />
                </button>
                <button
                  onClick={() => handleRemove(livre.id_livre)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;
