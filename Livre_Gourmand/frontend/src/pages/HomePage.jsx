import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const featuredBooks = [
    { 
      id: 1, 
      title: "Cuisine Française", 
      author: "Marie Dupont", 
      price: 29.99,
      image: "/path/to/book-image.jpg"
    },
    // Ajoutez plus de livres
  ];

  return (
    <div className="bg-background min-h-screen">
      <section className="hero bg-primary text-white py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Découvrez le Monde Culinaire</h1>
          <p className="text-xl mb-6">Explorez nos collections de livres de cuisine</p>
          <Link 
            to="/shop" 
            className="bg-secondary text-white px-6 py-3 rounded-lg hover:bg-secondary/90"
          >
            Explorer la Boutique
          </Link>
        </div>
      </section>

      <section className="featured-books container mx-auto py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Livres à la Une</h2>
        <div className="grid grid-cols-4 gap-6">
          {featuredBooks.map(book => (
            <div 
              key={book.id} 
              className="bg-white rounded-lg shadow-md p-4 text-center"
            >
              <img 
                src={book.image} 
                alt={book.title} 
                className="mx-auto mb-4 h-64 object-cover"
              />
              <h3 className="font-bold text-primary">{book.title}</h3>
              <p className="text-gray-600">{book.author}</p>
              <p className="font-bold text-secondary">{book.price.toFixed(2)} €</p>
              <button className="mt-4 bg-primary text-white px-4 py-2 rounded">
                Ajouter au panier
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;