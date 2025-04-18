import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookService } from '../services/bookService';
import { FaShoppingCart, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';

const MotionLink = motion(Link);

const HomePage = () => {
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentBooks = async () => {
      try {
        setLoading(true);
        const data = await bookService.getRecentBooks(4);
        
        // Calculer la note moyenne pour chaque livre
        const booksWithRatings = data.map(book => {
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
        
        setRecentBooks(booksWithRatings);
        setLoading(false);
      } catch (err) {
        setError('Impossible de charger les livres récents');
        setLoading(false);
        console.error(err);
      }
    };

    fetchRecentBooks();
  }, []);

  // Définition des catégories avec leurs identifiants correspondants utilisés dans la BDD
  const categories = [
    { name: 'Française', icon: '🥐', value: 'FRANCAISE' },
    { name: 'Italienne', icon: '🍝', value: 'ITALIENNE' },
    { name: 'Asiatique', icon: '🍜', value: 'ASIATIQUE' },
    { name: 'Pâtisserie', icon: '🍰', value: 'PATISSERIE' },
    { name: 'Végétarienne', icon: '🥗', value: 'VEGETARIENNE' },
    { name: 'Vins', icon: '🍷', value: 'VINS' }
  ];

  return (
    <div className="relative">
      {/* Héros */}
      <section
        className="hero bg-cover bg-center bg-no-repeat relative h-[600px] flex items-center justify-center text-white"
        style={{ backgroundImage: `url('/images/fondImageHomepage.jpg')` }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center container mx-auto px-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Découvrez le Monde Culinaire
          </h1>
          <p className="text-xl mb-6 text-white">
            Explorez nos collections de livres de cuisine
          </p>
          <MotionLink
            to="/shop"
            className="bg-secondary text-white px-6 py-3 rounded-lg hover:bg-secondary/90 transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            Explorer la Boutique
          </MotionLink>
        </motion.div>
      </section>

      {/* Livres récents */}
      <section className="featured-books container mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-primary">
          Livres Récemment Ajoutés
        </h2>

        {loading ? (
          <div className="text-center py-8 animate-pulse">Chargement...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentBooks.map((book, index) => (
              <motion.div
                key={book.id_livre}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.07, 
                  boxShadow: '0px 15px 30px rgba(0, 0, 0, 0.25)', 
                  y: -5 
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer"
              >
                <Link
                  to={`/book/${book.id_livre}`}
                  className="block hover:opacity-90 transition-opacity duration-300"
                >
                  <div className="h-64 bg-gray-200 overflow-hidden">
                    {book.image_url ? (
                      <img
                        src={book.image_url.startsWith('http') ? book.image_url : `http://localhost:3001${book.image_url}`}
                        alt={book.titre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <span className="text-primary">Image non disponible</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-primary text-lg mb-2 line-clamp-2">{book.titre}</h3>
                    <p className="text-gray-600 mb-2">{book.auteur}</p>

                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400 mr-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            className={`${
                              star <= Math.round(book.averageRating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        ({book.reviewCount} avis)
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-bold text-secondary">
                        {parseFloat(book.prix).toFixed(2)} €
                      </span>
                      <button className="bg-primary text-white px-3 py-1 rounded flex items-center hover:bg-primary/90 transition-colors">
                        <FaShoppingCart className="mr-1" />
                        <span>Ajouter</span>
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            to="/shop"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Voir tous les livres
          </Link>
        </div>
      </section>

      {/* Catégories */}
      <motion.section
        className="categories bg-white py-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">
            Nos Catégories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Link 
                  to={`/shop?categorie=${category.value}`} 
                  className="block bg-background rounded-lg p-4 text-center hover:bg-secondary/10 transition-colors h-full"
                >
                  <span className="text-4xl mb-2 block">{category.icon}</span>
                  <span className="text-primary font-medium">{category.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;