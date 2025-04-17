import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookService } from '../services/bookService';
import { FaShoppingCart, FaStar } from 'react-icons/fa';

const HomePage = () => {
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentBooks = async () => {
      try {
        setLoading(true);
        const data = await bookService.getRecentBooks(4); // Récupérer 4 livres récents
        setRecentBooks(data);
        setLoading(false);
      } catch (err) {
        setError('Impossible de charger les livres récents');
        setLoading(false);
        console.error(err);
      }
    };

    fetchRecentBooks();
  }, []);

  return (
    <div className="relative">
      {/* Section Héroïque avec image de fond */}
      <section 
        className="hero bg-cover bg-center bg-no-repeat relative h-[600px] flex items-center justify-center text-white"
        style={{ 
          backgroundImage: `url('/images/fondImageHomepage.jpg')`,
        }}
      >
        {/* Overlay sombre pour améliorer la lisibilité du texte */}
        <div className="absolute inset-0 bg-black opacity-50"></div>
        
        <div className="relative z-10 text-center container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Découvrez le Monde Culinaire</h1>
          <p className="text-xl mb-6 text-white">Explorez nos collections de livres de cuisine</p>
          <Link 
            to="/shop" 
            className="bg-secondary text-white px-6 py-3 rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Explorer la Boutique
          </Link>
        </div>
      </section>

      {/* Livres à la Une */}
      <section className="featured-books container mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-primary">Livres Récemment Ajoutés</h2>
        
        {loading ? (
          <div className="text-center py-8">Chargement des livres récents...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentBooks.map(book => (
              <Link 
                to={`/book/${book.id_livre}`}
                key={book.id_livre} 
                className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform"
              >
                <div className="h-64 bg-gray-200 overflow-hidden">
                  {book.image_url ? (
                    <img 
                      src={book.image_url} 
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
                          className={`${star <= Math.round(book.note_moyenne || 0) ? 'text-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      ({book.nombre_avis || 0} avis)
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-secondary">
                      {book.prix 
                        ? (typeof book.prix === 'number' 
                            ? book.prix.toFixed(2) 
                            : parseFloat(book.prix).toFixed(2)) 
                        : '0.00'} €
                    </span>
                    <button className="bg-primary text-white px-3 py-1 rounded flex items-center hover:bg-primary/90 transition-colors">
                      <FaShoppingCart className="mr-1" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                </div>
              </Link>
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

      {/* Le reste de votre code (catégories, newsletter, etc.) reste inchangé */}
      {/* Catégories */}
      <section className="categories bg-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">Nos Catégories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: "Française", icon: "🥐" },
              { name: "Italienne", icon: "🍝" },
              { name: "Asiatique", icon: "🍜" },
              { name: "Pâtisserie", icon: "🍰" },
              { name: "Végétarienne", icon: "🥗" },
              { name: "Vins", icon: "🍷" }
            ].map((category, index) => (
              <div 
                key={index} 
                className="bg-background rounded-lg p-4 text-center hover:bg-secondary/10 transition-colors"
              >
                <span className="text-4xl mb-2 block">{category.icon}</span>
                <span className="text-primary font-medium">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter bg-primary text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Restez Informé</h2>
          <p className="mb-6">Abonnez-vous à notre newsletter pour recevoir nos dernières nouveautés</p>
          <form className="max-w-md mx-auto flex">
            <input 
              type="email" 
              placeholder="Votre email" 
              className="flex-grow px-4 py-2 text-gray-800 rounded-l-lg" 
            />
            <button 
              type="submit" 
              className="bg-secondary text-white px-6 py-2 rounded-r-lg hover:bg-secondary/90 transition-colors"
            >
              S'abonner
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomePage;