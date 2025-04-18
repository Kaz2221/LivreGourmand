import React, { useState, useContext } from 'react';
import { FaStar, FaUser, FaCalendarAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { bookService } from '../../services/bookService';
import { AuthContext } from '../../context/AuthContext';

const BookReviews = ({ bookId, reviews = [], onReviewAdded }) => {
  // Débogage
  console.log("BookReviews - bookId:", bookId);
  console.log("BookReviews - reviews:", reviews);
  console.log("BookReviews - reviews type:", typeof reviews);
  console.log("BookReviews - reviews length:", Array.isArray(reviews) ? reviews.length : 'not an array');

  // Assurez-vous que reviews est un tableau
  const safeReviews = Array.isArray(reviews) ? reviews : [];

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const { isAuthenticated, user } = useContext(AuthContext);

  // Calculer la note moyenne
  const averageRating = safeReviews.length > 0
    ? (safeReviews.reduce((sum, review) => sum + (review.note || 0), 0) / safeReviews.length).toFixed(1)
    : 'N/A';

  // Vérifier si l'utilisateur a déjà laissé un avis
  const hasReviewed = user && safeReviews.some(review => 
    review.utilisateur?.id_utilisateur === user.id);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Vous devez être connecté pour laisser un avis');
      return;
    }

    if (rating < 1) {
      setError('Veuillez sélectionner une note');
      return;
    }

    if (comment.trim().length < 5) {
      setError('Votre commentaire doit comporter au moins 5 caractères');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await bookService.addReview(bookId, { note: rating, commentaire: comment });
      
      setSuccess(true);
      setComment('');
      setRating(5);
      
      // Si une fonction de callback est fournie, l'appeler
      if (onReviewAdded) {
        onReviewAdded();
      }
      
      // Réinitialiser le succès après 5 secondes
      setTimeout(() => {
        setSuccess(false);
        setShowReviewForm(false);
      }, 5000);
    } catch (err) {
      console.error('Erreur lors de l\'ajout de l\'avis:', err);
      setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'envoi de votre avis');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatter la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    } catch (e) {
      console.error("Erreur lors du formatage de la date:", e);
      return 'Date invalide';
    }
  };

  // Filtrer les avis pour n'afficher que ceux qui sont validés ou en attente de l'utilisateur actuel
  const displayReviews = safeReviews;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-primary mb-6">Avis des lecteurs ({safeReviews.length})</h2>
      
      {/* Résumé des avis */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <div className="text-4xl font-bold text-primary mb-2">
              {averageRating}
            </div>
            <div className="flex text-yellow-400 mb-1 justify-center md:justify-start">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`${
                    star <= Math.round(parseFloat(averageRating) || 0)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600">
              Basé sur {safeReviews.length} avis
            </div>
          </div>
          
          <div>
            {!isAuthenticated ? (
              <p className="text-center text-gray-600">
                <a href="/login" className="text-primary hover:underline">Connectez-vous</a> pour laisser un avis
              </p>
            ) : hasReviewed ? (
              <p className="text-center text-gray-600">
                Vous avez déjà donné votre avis sur ce livre
              </p>
            ) : showReviewForm ? (
              <button
                onClick={() => setShowReviewForm(false)}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            ) : (
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Donner mon avis
              </button>
            )}
          </div>
        </div>
        
        {/* Formulaire d'ajout d'avis */}
        <AnimatePresence>
          {showReviewForm && isAuthenticated && !hasReviewed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {success ? (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  <div className="flex items-center">
                    <FaCheckCircle className="mr-2" />
                    <p>Merci pour votre avis ! Il sera visible après validation par notre équipe.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="border-t pt-6">
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                      <div className="flex items-center">
                        <FaTimesCircle className="mr-2" />
                        <p>{error}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Votre note</label>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          className="text-2xl mr-1 focus:outline-none"
                          onClick={() => handleRatingChange(star)}
                          onMouseEnter={() => setHover(star)}
                          onMouseLeave={() => setHover(0)}
                        >
                          <FaStar
                            className={`${
                              star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">
                      Votre commentaire
                    </label>
                    <textarea
                      id="comment"
                      value={comment}
                      onChange={handleCommentChange}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      rows="4"
                      placeholder="Partagez votre expérience avec ce livre..."
                      required
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:bg-gray-400"
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Soumettre mon avis'}
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Liste des avis */}
      {displayReviews.length > 0 ? (
        <div className="space-y-6">
          {displayReviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md p-6 relative"
            >
              {review && !review.valide && (
                <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                  En attente de validation
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center">
                    <div className="bg-secondary text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                      <FaUser />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {review.utilisateur?.username || review.utilisateur?.nom || 'Utilisateur'}
                      </h3>
                      <div className="flex text-yellow-400 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            className={`${
                              star <= (review.note || 0) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 flex items-center">
                  <FaCalendarAlt className="mr-1" />
                  {formatDate(review.date_avis)}
                </div>
              </div>
              
              <p className="text-gray-700">{review.commentaire || "Aucun commentaire"}</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
          Aucun avis pour ce livre pour le moment. Soyez le premier à donner votre avis !
        </div>
      )}
    </div>
  );
};

export default BookReviews;