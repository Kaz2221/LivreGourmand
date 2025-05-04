// frontend/src/pages/admin/OrdersManagementPage.jsx
import React from 'react';
import OrderManagement from '../../components/admin/OrderManagement';
import AdminLayout from '../../components/admin/AdminLayout';

const OrdersManagementPage = () => {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Gestion des Commandes</h1>
        <p className="text-gray-600">Gérez et modifiez le statut des commandes des clients</p>
      </div>
      
      <OrderManagement />
    </AdminLayout>
  );
};

export default OrdersManagementPage;