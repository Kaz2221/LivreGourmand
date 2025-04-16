import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookService } from '../services/bookService';

const HomePage = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        const data = await bookService.getFeaturedBooks();
        setFeaturedBooks(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load featured books');
        setLoading(false);
      }
    };

    fetchFeaturedBooks();
  }, []);

  const categories = [
    { name: 'French', icon: '🥐', path: '/categories/francaise' },
    { name: 'Italian', icon: '🍝', path: '/categories/italienne' },
    { name: 'Asian', icon: '🍜', path: '/categories/asiatique' },
    { name: 'Desserts', icon: '🍰', path: '/categories/patisserie' },
    { name: 'Vegetarian', icon: '🥗', path: '/categories/vegetarienne' },
    { name: 'Wine', icon: '🍷', path: '/categories/vins' },
    { name: 'Cocktails', icon: '🍹', path: '/categories/cocktails' },
    { name: 'BBQ', icon: '🍖', path: '/categories/bbq' },
  ];

  const reviews = [
    {
      id: 1,
      text: "This French cuisine cookbook has been life-changing! The recipes are so well explained and delicious.",
      author: "Sophie Bernard",
      rating: 5
    },
    {
      id: 2,
      text: "Perfect for beginners, made my first soufflé following the step-by-step instructions and it was perfect!",
      author: "Michael Roberts",
      rating: 5
    },
    {
      id: 3,
      text: "These Vietnamese recipes reminded me of home! The flavors are authentic and the techniques easy to follow.",
      author: "Linh Tran",
      rating: 5
    }
  ];

  return (
    <div className="bg-[#F5E6D3]">
      {/* Hero Section */}
      <section className="relative h-96">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="relative h-full bg-cover bg-center" style={{ backgroundImage: "url('/hero-image.jpg')" }}>
          <div className="container mx-auto px-4 h-full flex items-center relative z-20">
            <div className="text-white max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore the World of Culinary Arts</h1>
              <p className="text-xl mb-6">Discover recipes from around the world with our collection of premium cookbooks</p>
              <Link to="/shop" className="bg-[#B39B84] hover:bg-[#a38a76] text-white px-6 py-3 rounded-md font-medium">
                Discover Books
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cookbooks */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Featured Cookbooks</h2>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4A4A5C]"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {featuredBooks.map((book) => (
                <div key={book.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <Link to={`/book/${book.id}`}>
                    <img 
                      src={book.image_url || '/book-placeholder.jpg'} 
                      alt={book.title} 
                      className="w-full h-64 object-cover"
                    />
                  </Link>
                  <div className="p-4">
                    <Link to={`/book/${book.id}`} className="block">
                      <h3 className="text-lg font-semibold mb-1 text-[#4A4A5C] hover:text-[#B39B84]">{book.title}</h3>
                    </Link>
                    <p className="text-gray-600 mb-2">{book.author}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#4A4A5C]">${book.price.toFixed(2)}</span>
                      <button className="bg-[#4A4A5C] hover:bg-[#3a3a49] text-white px-3 py-1 rounded text-sm">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Browse Categories */}
      <section className="py-12 bg-[#E5D6C3]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Browse Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <Link 
                to={category.path} 
                key={index}
                className="bg-white rounded-lg p-4 text-center shadow hover:shadow-md transition-shadow flex flex-col items-center"
              >
                <span className="text-3xl mb-2">{category.icon}</span>
                <span className="font-medium text-[#4A4A5C]">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Customer Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-[#F8F3EE] p-6 rounded-lg shadow">
                <div className="flex mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg 
                      key={i} 
                      className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{review.text}"</p>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-[#B39B84] flex items-center justify-center text-white font-bold">
                    {review.author.charAt(0)}
                  </div>
                  <span className="ml-2 font-medium">{review.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 bg-[#4A4A5C] text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Join Our Culinary Community</h2>
            <p>Subscribe for cooking updates, exclusive discounts, and recipe ideas.</p>
          </div>
          <form className="max-w-md mx-auto flex">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-grow px-4 py-2 rounded-l-md text-gray-800 focus:outline-none"
            />
            <button 
              type="submit" 
              className="bg-[#B39B84] hover:bg-[#a38a76] px-6 py-2 rounded-r-md font-medium"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomePage;