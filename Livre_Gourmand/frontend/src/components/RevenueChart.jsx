import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const RevenueChart = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        // Récupérer les données de ventes mensuelles
        const response = await api.get('/api/back/dashboard/sales', {
          params: { periode: 'mois' }
        });
        
        // Transformer les données pour l'affichage
        const formattedData = response.data.map(item => {
          // Le format attendu de l'API est { mois: "2023-01", commandes: 15, total: 1250 }
          const date = new Date(item.mois);
          const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
          
          return {
            name: monthNames[date.getMonth()],
            profit: parseFloat(item.total || 0),
            loss: Math.random() * 1000 // Simulé pour l'exemple - à remplacer par vos données réelles
          };
        });
        
        setSalesData(formattedData);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des données de ventes:', err);
        setError('Impossible de charger les données de ventes.');
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  // Si aucune donnée n'est disponible, ajouter des données de démonstration
  const demoData = [
    { name: 'Jan', profit: 4000, loss: 2400 },
    { name: 'Fév', profit: 3000, loss: 1398 },
    { name: 'Mar', profit: 2000, loss: 9800 },
    { name: 'Avr', profit: 2780, loss: 3908 },
    { name: 'Mai', profit: 1890, loss: 4800 },
    { name: 'Jun', profit: 2390, loss: 3800 },
    { name: 'Jul', profit: 3490, loss: 4300 },
    { name: 'Aoû', profit: 4000, loss: 2400 },
    { name: 'Sep', profit: 3000, loss: 1398 }
  ];

  const displayData = salesData.length > 0 ? salesData : demoData;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center text-white/70">
        {error}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={displayData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff33" />
        <XAxis dataKey="name" stroke="#ffffffaa" />
        <YAxis stroke="#ffffffaa" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#4A4A5C', 
            border: 'none',
            borderRadius: '4px',
            color: 'white'
          }} 
        />
        <Legend />
        <Bar dataKey="profit" name="Profit" fill="#B39B84" radius={[4, 4, 0, 0]} />
        <Bar dataKey="loss" name="Perte" fill="#ffffff55" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;