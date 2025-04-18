// backend/routes/front/userRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile  } = require('../../controllers/front/userController');
const { protect } = require('../../middlewares/authMiddleware');

// Routes publiques
router.post('/register', registerUser);
router.post('/login', loginUser);

// Routes protégées
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile); // Assurez-vous que cette ligne existe

module.exports = router;