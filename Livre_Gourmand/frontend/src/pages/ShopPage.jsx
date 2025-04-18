// frontend/src/pages/ShopPage.jsx
import React, { useEffect, useState } from 'react';
import { bookService } from '../services/bookService';
import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ShopPage = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState(100);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await bookService.getBooks();
        setBooks(res.livres);
        setFilteredBooks(res.livres);
      } catch (err) {
        console.error('Erreur lors du chargement des livres:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    const results = books.filter(
      book =>
        (book.titre.toLowerCase().includes(term) ||
        book.auteur.toLowerCase().includes(term)) &&
        (category === '' || book.categorie === category) &&
        parseFloat(book.prix) <= price
    );
    setFilteredBooks(results);
  }, [search, category, price, books]);

  return (
    <motion.div
      className="container mx-auto px-4 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold text-primary mb-6">Boutique</h1>

      {/* Search Bar */}
      <div className="flex items-center mb-8">
        <div className="relative w-full md:w-1/2">
          <motion.input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un livre..."
            className="w-full border px-4 py-2 rounded-full focus:ring-2 focus:ring-primary focus:outline-none"
            whileFocus={{ scale: 1.03, borderColor: '#f97316' }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
          <FaSearch className="absolute top-2.5 right-4 text-gray-500" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters */}
        <aside className="md:w-1/4">
          <div className="bg-white p-4 rounded-lg shadow sticky top-20">
            <h2 className="font-bold text-primary mb-4">Filtres</h2>
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Catégorie</label>
              <select 
                className="w-full border px-3 py-1 rounded"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Toutes</option>
                <option value="FRANCAISE">Française</option>
                <option value="ASIATIQUE">Asiatique</option>
                <option value="ITALIENNE">Italienne</option>
                <option value="VEGETARIENNE">Végétarienne</option>
                <option value="PATISSERIE">Pâtisserie</option>
                <option value="VINS">Vins</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Prix max : {price} €</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={price} 
                onChange={(e) => setPrice(Number(e.target.value))} 
                className="w-full" 
              />
            </div>
          </div>
        </aside>

        {/* Book Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-primary text-lg animate-pulse">Chargement des livres...</div>
          ) : (
            filteredBooks.map((book) => (
              <motion.div
                key={book.id_livre}
                className="bg-white rounded-lg shadow p-4 transition-transform duration-300"
                whileHover={{ scale: 1.03, boxShadow: '0 10px 15px rgba(0,0,0,0.1)', y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link to={`/book/${book.id_livre}`} className="block hover:opacity-90 transition-opacity duration-300">
                  <div className="h-48 bg-gray-100 rounded overflow-hidden mb-4">
                    {book.image_url ? (
                      <img
                        src={book.image_url.startsWith('http') ? book.image_url : `http://localhost:3001${book.image_url}`}
                        alt={book.titre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">📚</div>
                    )}
                  </div>
                  <h3 className="font-bold text-primary text-lg mb-1">{book.titre}</h3>
                  <p className="text-sm text-gray-600">{book.auteur}</p>
                  <p className="text-primary font-semibold mt-1">{parseFloat(book.prix).toFixed(2)} €</p>
                  {book.stock > 20 && <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Nouveau</span>}
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ShopPage;
