import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const featuredBooks = [
    { 
      id: 1, 
      title: "Cuisine Française", 
      author: "Marie Dupont", 
      price: 29.99,
      image: "/images/french-cuisine.jpg" // Vous devrez ajouter cette image
    },
    // Ajoutez plus de livres si nécessaire
  ];

  return (
    <div className="relative">
    {/* Section Héroïque avec image de fond */}
    <section 
      className="hero bg-cover bg-center bg-no-repeat relative h-[600px] flex items-center justify-center text-white"
      style={{ 
        backgroundImage: `url('/images/fondImageHomepage.jpg')`, // Assurez-vous que cette image existe
        backgroundOverlay: 'absolute inset-0 bg-black bg-opacity-50'
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
        <h2 className="text-3xl font-bold text-center mb-8 text-primary">Livres à la Une</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {featuredBooks.map(book => (
            <div 
              key={book.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform"
            >
              <img 
                src={book.image} 
                alt={book.title} 
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-primary text-lg mb-2">{book.title}</h3>
                <p className="text-gray-600 mb-2">{book.author}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-secondary">{book.price.toFixed(2)} €</span>
                  <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors">
                    Ajouter au panier
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

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