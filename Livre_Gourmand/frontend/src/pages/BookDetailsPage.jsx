// src/pages/BookDetailsPage.jsx - mise à jour
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaArrowLeft } from 'react-icons/fa';
import { bookService } from '../services/bookService';
import AddToCartButton from '../components/common/AddToCartButton';

const BookDetailsPage = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const bookData = await bookService.getBookById(parseInt(id));
        setBook(bookData);
        
        // Récupérer les recommandations (livres de la même catégorie)
        if (bookData.categorie) {
          const booksData = await bookService.getBooks({ 
            categorie: bookData.categorie,
            limit: 3
          });
          // Filtrer pour exclure le livre actuel
          const filteredBooks = booksData.livres.filter(b => b.id_livre !== bookData.id_livre);
          setRecommendations(filteredBooks.slice(0, 3)); // Limiter à 3 recommandations
        }
      } catch (err) {
        console.error('Erreur lors du chargement des détails du livre:', err);
        setError('Impossible de charger les détails du livre');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin inline-block h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
          <p className="mt-2">Chargement des détails du livre...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error || 'Livre non trouvé'}</div>
        <div className="text-center mt-4">
          <Link to="/" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90">
            Retourner à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Section détails du livre */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Image du livre */}
            <div className="w-full md:w-1/3">
              <div className="bg-gray-200 rounded-lg overflow-hidden h-96">
                {book.image_url ? (
                  <img 
                    src={book.image_url.startsWith('http') 
                      ? book.image_url 
                      : `http://localhost:3001${book.image_url}`}
                    alt={book.titre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-center p-4">
                    <span className="text-primary text-6xl">
                      {book.categorie === "FRANCAISE" && "🇫🇷"}
                      {book.categorie === "ITALIENNE" && "🇮🇹"}
                      {book.categorie === "ASIATIQUE" && "🍜"}
                      {book.categorie === "VEGETARIENNE" && "🥗"}
                      {book.categorie === "PATISSERIE" && "🍰"}
                      {book.categorie === "VINS" && "🍷"}
                      {!["FRANCAISE", "ITALIENNE", "ASIATIQUE", "VEGETARIENNE", "PATISSERIE", "VINS"].includes(book.categorie) && "📚"}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Section d'ajout au panier */}
              <div className="mt-6">
                <div className="flex items-center mb-4">
                  <label htmlFor="quantity" className="mr-3 text-gray-700 font-medium">Quantité:</label>
                  <div className="relative flex items-center w-24">
                    <button 
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-600 h-8 w-8 rounded-l flex items-center justify-center"
                    >-</button>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="h-8 w-full border-t border-b text-center"
                    />
                    <button 
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-600 h-8 w-8 rounded-r flex items-center justify-center"
                    >+</button>
                  </div>
                </div>

                <AddToCartButton 
                  livre={book} 
                  quantite={quantity} 
                  className="w-full"
                />
              </div>
              
              <Link 
                to="/shop" 
                className="mt-4 flex items-center justify-center text-primary hover:underline"
              >
                <FaArrowLeft className="mr-1" /> Continuer mes achats
              </Link>
            </div>
            
            {/* Informations du livre */}
            <div className="w-full md:w-2/3">
              <h1 className="text-3xl font-bold text-primary mb-2">{book.titre}</h1>
              
              {/* Note et avis */}
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 mr-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar 
                      key={star} 
                      className={`${star <= Math.round(book.note_moyenne || 0) ? 'text-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  ({book.nombre_avis || 0} avis)
                </span>
              </div>
              
              <p className="text-xl text-secondary font-bold mb-4">
                {book.prix ? parseFloat(book.prix).toFixed(2) : '0.00'} €
              </p>
              
              <div className="mb-6">
                <h2 className="text-xl font-bold text-primary mb-2">Résumé</h2>
                <p className="text-gray-700">
                  {book.description || "Aucune description disponible pour ce livre."}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-primary">Détails du livre</h3>
                  <ul className="mt-2 space-y-1">
                    <li><span className="text-gray-600">Auteur:</span> {book.auteur}</li>
                    <li><span className="text-gray-600">Catégorie:</span> {book.categorie}</li>
                    <li><span className="text-gray-600">Niveau:</span> {book.niveau_expertise}</li>
                    <li>
                      <span className="text-gray-600">Stock:</span> {' '}
                      <span className={`font-medium ${book.stock > 10 ? 'text-green-600' : book.stock > 0 ? 'text-orange-500' : 'text-red-600'}`}>
                        {book.stock > 0 ? `${book.stock} disponible(s)` : 'Épuisé'}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Section recommandations */}
        {recommendations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-primary mb-6">Recommandations de lecture</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map(rec => (
                <div key={rec.id_livre} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    {rec.image_url ? (
                      <img 
                        src={rec.image_url.startsWith('http') 
                          ? rec.image_url 
                          : `http://localhost:3001${rec.image_url}`}
                        alt={rec.titre}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-center p-4">
                        <span className="text-primary text-4xl">
                          {rec.categorie === "FRANCAISE" && "🇫🇷"}
                          {rec.categorie === "ITALIENNE" && "🇮🇹"}
                          {rec.categorie === "ASIATIQUE" && "🍜"}
                          {rec.categorie === "VEGETARIENNE" && "🥗"}
                          {rec.categorie === "PATISSERIE" && "🍰"}
                          {rec.categorie === "VINS" && "🍷"}
                          {!["FRANCAISE", "ITALIENNE", "ASIATIQUE", "VEGETARIENNE", "PATISSERIE", "VINS"].includes(rec.categorie) && "📚"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-primary mb-2 line-clamp-1">{rec.titre}</h3>
                    <p className="text-gray-600 mb-2 line-clamp-1">{rec.auteur}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-secondary">{parseFloat(rec.prix).toFixed(2)} €</span>
                      <Link 
                        to={`/book/${rec.id_livre}`}
                        className="bg-primary text-white text-sm px-3 py-1 rounded block text-center hover:bg-primary/90"
                      >
                        Voir ce livre
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetailsPage;