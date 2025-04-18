// frontend/src/pages/ContactPage.jsx
import React, { useState } from 'react';
import { FaFacebook, FaInstagram, FaYoutube, FaTiktok, FaPinterest } from 'react-icons/fa';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Message envoyé:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-3xl font-bold text-primary mb-6">Contactez-nous</h1>

      {submitted && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded mb-6">
          Votre message a été envoyé avec succès !
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-gray-700 font-medium mb-1">Nom</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-gray-700 font-medium mb-1">Message</label>
          <textarea 
            id="message" 
            name="message" 
            value={formData.message} 
            onChange={handleChange} 
            required 
            rows="5"
            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          ></textarea>
        </div>

        <button 
          type="submit"
          className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          Envoyer
        </button>
      </form>

      <div className="mt-10 text-gray-700">
        <h2 className="text-xl font-bold mb-4">Nos coordonnées</h2>
        <p className="mb-2">📍 123 Rue des Saveurs, Montréal, QC H2X 1Y4</p>
        <p className="mb-2">📞 (514) 123-4567</p>
        <p className="mb-2">✉️ contact@livresgourmands.ca</p>
        <p>🕒 Lundi au Vendredi : 9h00 - 17h00</p>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4 text-gray-700">Suivez-nous</h2>
        <div className="grid grid-cols-3 gap-4 text-3xl text-primary justify-items-center">
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform"><FaFacebook /></a>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform"><FaInstagram /></a>
          <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform"><FaYoutube /></a>
          <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform"><FaTiktok /></a>
          <a href="https://www.pinterest.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform"><FaPinterest /></a>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
