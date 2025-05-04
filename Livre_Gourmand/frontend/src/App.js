// frontend/src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import BookDetailsPage from './pages/BookDetailsPage';
import LoginPage from './pages/LoginPage';
import CheckoutPage from './pages/CheckoutPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import ContactPage from './pages/ContactPage';
import WishlistPage from './pages/WishlistPage';
import ShopPage from './pages/ShopPage';
import SuccessPage from './pages/SuccessPage';
import CancelPage from './pages/CancelPage';
import OrdersHistoryPage from './pages/OrdersHistoryPage';
import OrderDetailsPage from './pages/OrderDetailsPage';

// Import du dashboard administrateur et de la page de gestion des commandes
import DashboardPage from './pages/admin/DashboardPage';
import OrdersManagementPage from './pages/admin/OrdersManagementPage';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="App flex flex-col min-h-screen">
          <Header />

          <main className="flex-grow">
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<HomePage />} />
              <Route path="/book/:id" element={<BookDetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/cancel" element={<CancelPage />} />
              
              {/* Routes protégées pour utilisateurs connectés */}
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/cart" 
                element={
                  <PrivateRoute>
                    <CartPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/wishlist" 
                element={
                  <PrivateRoute>
                    <WishlistPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/checkout" 
                element={
                  <PrivateRoute>
                    <CheckoutPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/my-orders" 
                element={
                  <PrivateRoute>
                    <OrdersHistoryPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/my-orders/:id" 
                element={
                  <PrivateRoute>
                    <OrderDetailsPage />
                  </PrivateRoute>
                } 
              />

              {/* Routes protégées pour administrateurs */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <AdminRoute>
                    <DashboardPage />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/orders" 
                element={
                  <AdminRoute>
                    <OrdersManagementPage />
                  </AdminRoute>
                } 
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;