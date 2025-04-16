import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

// Importez d'autres pages au fur et à mesure
// import ShopPage from './pages/ShopPage';
// import CartPage from './pages/CartPage';

function App() {
  return (
    <div className="App">
      <Header /> {/* Composant de navigation commun à toutes les pages */}
      
      <Routes>
        {/* Route principale (page d'accueil) */}
        <Route path="/" element={<HomePage />} />
        
        {/* Route de connexion */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Ajoutez d'autres routes au fur et à mesure */}
        {/* <Route path="/shop" element={<ShopPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/categories" element={<CategoriesPage />} /> */}
      </Routes>
      
      {/* Vous pouvez ajouter un Footer ici si nécessaire */}
    </div>
  );
}

export default App;