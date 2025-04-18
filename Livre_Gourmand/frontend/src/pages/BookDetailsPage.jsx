import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaArrowLeft } from 'react-icons/fa';
import { bookService } from '../services/bookService';
import AddToCartButton from '../components/common/AddToCartButton';
import WishlistButton from '../components/common/WishlistButton';
import { motion } from 'framer-motion';

const BookDetailsPage = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlistId, setWishlistId] = useState(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const bookData = await bookService.getBookById(parseInt(id));
        setBook(bookData);
        setWishlistId(1);
      } catch (err) {
        console.error('Erreur lors du chargement des détails du livre:', err);
        setError('Impossible de charger les détails du livre');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBookDetails();
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  if (loading) return <div className="text-center py-20">Chargement...</div>;
  if (error || !book) return <div className="text-center text-red-500">{error || 'Livre non trouvé'}</div>;

  return (
    <motion.div
      className="container mx-auto px-4 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white rounded-xl shadow-md p-6 md:p-10 flex flex-col md:flex-row gap-8">
        <motion.div
          className="w-full md:w-1/3 relative"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="bg-gray-200 rounded-lg overflow-hidden h-96 shadow-lg"
            animate={shake ? { x: [0, -5, 5, -5, 5, 0] } : {}}
            transition={{ duration: 0.6 }}
          >
            {book.image_url ? (
              <img
                src={book.image_url.startsWith('http') ? book.image_url : `http://localhost:3001${book.image_url}`}
                alt={book.titre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-6xl">
                📚
              </div>
            )}
          </motion.div>

          {wishlistId && (
            <motion.div
              className="absolute top-2 right-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <WishlistButton idLivre={book.id_livre} idListeCadeaux={wishlistId} />
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="w-full md:w-2/3"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-primary mb-2">{book.titre}</h1>
          <div className="flex items-center mb-2 text-sm text-gray-600">
            <div className="flex text-yellow-400 mr-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar key={star} className={`${star <= Math.round(book.note_moyenne || 0) ? 'text-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span>({book.nombre_avis || 0} avis)</span>
          </div>

          <p className="text-xl text-secondary font-bold mb-4">{parseFloat(book.prix).toFixed(2)} €</p>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-primary mb-2">Résumé</h2>
            <p className="text-gray-700">{book.description || "Aucune description disponible."}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Détails du livre</h2>
            <p><span className="font-medium">Auteur:</span> {book.auteur}</p>
            <p><span className="font-medium">Catégorie:</span> {book.categorie}</p>
            <p><span className="font-medium">Niveau:</span> {book.niveau_expertise}</p>
            <p>
              <span className="font-medium">Stock:</span>{' '}
              {book.stock > 0 ? (
                <span className="text-green-600 font-medium">{book.stock} disponible(s)</span>
              ) : (
                <span className="text-red-600 font-medium">Rupture de stock</span>
              )}
            </p>
          </div>

          <div className="mb-6 flex items-center gap-3">
            <label htmlFor="quantity" className="text-gray-700 font-medium">Quantité:</label>
            <div className="flex items-center border rounded-md">
              <button
                onClick={handleDecrement}
                className="px-3 py-1 text-lg text-gray-700 hover:bg-gray-100"
              >-</button>
              <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-16 text-center py-1"
              />
              <button
                onClick={handleIncrement}
                className="px-3 py-1 text-lg text-gray-700 hover:bg-gray-100"
              >+</button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onClick={triggerShake}
          >
            <AddToCartButton livre={book} quantite={quantity} className="w-full" />
          </motion.div>

          <Link to="/shop" className="mt-6 inline-block text-primary hover:underline">
            <FaArrowLeft className="inline mr-1" /> Retour à la boutique
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BookDetailsPage;
