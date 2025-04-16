import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique de connexion
    console.log('Connexion', { email, password });
    // Exemple de redirection après connexion
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-primary mb-6">Connexion</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-2 text-gray-700">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Votre email"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block mb-2 text-gray-700">Mot de passe</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Votre mot de passe"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Se connecter
          </button>
        </form>
        
        <div className="text-center mt-6">
          <p>
            Pas de compte ? {' '}
            <Link to="/register" className="text-secondary hover:underline">
              Créez-en un
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;