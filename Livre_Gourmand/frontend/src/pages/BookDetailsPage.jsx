import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaArrowLeft } from 'react-icons/fa';
import { bookService } from '../services/bookService';
import AddToCartButton from '../components/common/AddToCartButton';
import WishlistButton from '../components/common/WishlistButton';
import BookReviews from '../components/common/BookReviews';
import { CartContext } from '../context/CartContext';
import { motion } from 'framer-motion';

const BookDetailsPage = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlistId, setWishlistId] = useState(null);
  const [shake, setShake] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const { triggerCartShake } = useContext(CartContext);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const bookData = await bookService.getBookById(parseInt(id));
      
      // Calculer la note moyenne des avis
      if (bookData.avis && bookData.avis.length > 0) {
        // Utiliser la propriété 'avis' (minuscule) de l'objet livre
        const sum = bookData.avis.reduce((total, avis) => total + avis.note, 0);
        bookData.averageRating = (sum / bookData.avis.length).toFixed(1);
        bookData.reviewCount = bookData.avis.length;
      } else {
        bookData.averageRating = 0;
        bookData.reviewCount = 0;
      }
      
      setBook(bookData);
      setWishlistId(1);
      
      // Une fois que nous avons les détails du livre, cherchons des recommandations
      if (bookData.categorie) {
        setLoadingRecommendations(true);
        try {
          const similarBooks = await bookService.getBooksByCategory(
            bookData.categorie, 
            4,  // Limiter à 4 livres
            parseInt(id) // Exclure le livre actuel
          );
          
          // Calculer la note moyenne pour chaque livre recommandé
          const booksWithRatings = similarBooks.map(book => {
            if (book.avis && book.avis.length > 0) {
              const sum = book.avis.reduce((total, avis) => total + avis.note, 0);
              book.averageRating = (sum / book.avis.length).toFixed(1);
              book.reviewCount = book.avis.length;
            } else {
              book.averageRating = 0;
              book.reviewCount = 0;
            }
            return book;
          });
          
          setRecommendations(booksWithRatings);
        } catch (recError) {
          console.error('Erreur lors du chargement des recommandations:', recError);
        } finally {
          setLoadingRecommendations(false);
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement des détails du livre:', err);
      setError('Impossible de charger les détails du livre');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
    // Déclencher également l'animation de secousse du panier dans le header
    triggerCartShake();
  };

  // Gestionnaire pour rafraîchir les données du livre après un nouvel avis
  const handleReviewAdded = () => {
    fetchBookDetails();
  };

  if (loading) return <div className="text-center py-20">Chargement...</div>;
  if (error || !book) return <div className="text-center text-red-500">{error || 'Livre non trouvé'}</div>;

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div
        className="bg-white rounded-xl shadow-md p-6 md:p-10 flex flex-col md:flex-row gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
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
                <FaStar 
                  key={star} 
                  className={`${star <= Math.round(book.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span>({book.reviewCount} avis)</span>
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
      </motion.div>

      {/* Section Avis */}
      <BookReviews 
        bookId={book.id_livre} 
        reviews={book.avis || []} 
        onReviewAdded={handleReviewAdded}
      />

      {/* Section de recommandations */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-primary mb-6">Vous pourriez aussi aimer</h2>
        
        {loadingRecommendations ? (
          <div className="text-center">Chargement des recommandations...</div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {recommendations.map((recBook) => (
              <motion.div
                key={recBook.id_livre}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link to={`/book/${recBook.id_livre}`} className="block">
                  <div className="h-40 bg-gray-200 overflow-hidden">
                    {recBook.image_url ? (
                      <img
                        src={recBook.image_url.startsWith('http') ? recBook.image_url : `http://localhost:3001${recBook.image_url}`}
                        alt={recBook.titre}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-4xl">
                        📚
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-primary truncate">{recBook.titre}</h3>
                    <p className="text-sm text-gray-600 truncate">{recBook.auteur}</p>
                    <div className="flex items-center mt-1 mb-2">
                      <div className="flex text-yellow-400 text-xs mr-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar 
                            key={star} 
                            className={`${star <= Math.round(recBook.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">({recBook.reviewCount})</span>
                    </div>
                    <p className="font-bold text-secondary">{parseFloat(recBook.prix).toFixed(2)} €</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">Aucune recommandation disponible pour ce livre.</p>
        )}
      </div>
    </div>
  );
};

export default BookDetailsPage;