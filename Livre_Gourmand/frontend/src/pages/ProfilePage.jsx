// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaEdit, FaSave } from 'react-icons/fa';
import { authService } from '../services/authService';
import { AuthContext } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    nom: '',
    email: '',
    adresse: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await authService.getUserProfile();
        setProfile(data);
        setFormData({
          username: data.username || '',
          nom: data.nom || '',
          email: data.email || '',
          adresse: data.adresse || ''
        });
      } catch (err) {
        console.error('Erreur lors du chargement du profil:', err);
        setError('Impossible de charger votre profil. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const updatedProfile = await authService.updateUserProfile(formData);
      setProfile(updatedProfile);
      setUser({ ...user, ...updatedProfile });
      setIsEditing(false);
      alert('Profil mis à jour avec succès !');
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      setError('Impossible de mettre à jour votre profil. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-primary text-white p-6">
            <h1 className="text-2xl font-bold">Mon Profil</h1>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
              {error}
            </div>
          )}
          
          <div className="p-6">
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Nom d'utilisateur</label>
                    <div className="flex items-center border rounded-md overflow-hidden">
                      <span className="bg-gray-100 p-2">
                        <FaUser className="text-gray-500" />
                      </span>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="flex-grow p-2 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Nom complet</label>
                    <div className="flex items-center border rounded-md overflow-hidden">
                      <span className="bg-gray-100 p-2">
                        <FaUser className="text-gray-500" />
                      </span>
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        className="flex-grow p-2 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Email</label>
                    <div className="flex items-center border rounded-md overflow-hidden">
                      <span className="bg-gray-100 p-2">
                        <FaEnvelope className="text-gray-500" />
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="flex-grow p-2 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 mb-2">Adresse</label>
                    <div className="flex items-start border rounded-md overflow-hidden">
                      <span className="bg-gray-100 p-2">
                        <FaMapMarkerAlt className="text-gray-500 mt-1" />
                      </span>
                      <textarea
                        name="adresse"
                        value={formData.adresse}
                        onChange={handleChange}
                        className="flex-grow p-2 focus:outline-none"
                        rows="3"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md mr-2"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-white px-4 py-2 rounded-md flex items-center"
                    disabled={loading}
                  >
                    {loading ? 'Enregistrement...' : (
                      <>
                        <FaSave className="mr-2" /> Enregistrer
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-gray-600 text-sm mb-1">Nom d'utilisateur</h2>
                    <div className="flex items-center">
                      <FaUser className="text-primary mr-2" />
                      <span className="text-gray-800 font-medium">{profile?.username}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-gray-600 text-sm mb-1">Nom complet</h2>
                    <div className="flex items-center">
                      <FaUser className="text-primary mr-2" />
                      <span className="text-gray-800 font-medium">{profile?.nom}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-gray-600 text-sm mb-1">Email</h2>
                    <div className="flex items-center">
                      <FaEnvelope className="text-primary mr-2" />
                      <span className="text-gray-800 font-medium">{profile?.email}</span>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h2 className="text-gray-600 text-sm mb-1">Adresse</h2>
                    <div className="flex">
                      <FaMapMarkerAlt className="text-primary mr-2 mt-1" />
                      <span className="text-gray-800">{profile?.adresse || 'Aucune adresse enregistrée'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-secondary text-white px-4 py-2 rounded-md flex items-center"
                  >
                    <FaEdit className="mr-2" /> Modifier mon profil
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;