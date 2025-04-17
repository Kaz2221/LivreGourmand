// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import HomePage from './pages/HomePage';
import BookDetailsPage from './pages/BookDetailsPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <div className="App">
      <Header /> 
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book/:id" element={<BookDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* Autres routes... */}
      </Routes>
    </div>
  );
}

export default App;