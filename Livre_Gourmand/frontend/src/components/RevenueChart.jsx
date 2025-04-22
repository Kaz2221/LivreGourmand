// Composant RevenueChart amélioré
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const RevenueChart = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('mois'); // 'jour', 'semaine', 'mois', 'annee'

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        // Récupérer les données de ventes pour la période sélectionnée
        const response = await api.get('/api/back/dashboard/sales', {
          params: { periode: period }
        });
        
        // Transformer les données pour l'affichage
        const formattedData = response.data.map(item => {
          // Le format attendu de l'API est { mois: "2023-01", commandes: 15, total: 1250 }
          // Pour les mois, convertir YYYY-MM en nom du mois
          let name = item[period] || '';
          
          if (period === 'mois' && name.includes('-')) {
            const [year, month] = name.split('-');
            const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
            name = monthNames[parseInt(month) - 1] + ' ' + year;
          }
          
          return {
            name: name,
            revenue: parseFloat(item.total || 0),
            orders: parseInt(item.commandes || 0)
          };
        });
        
        setSalesData(formattedData);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des données de ventes:', err);
        setError('Impossible de charger les données de ventes.');
        setLoading(false);
        
        // Utiliser des données de démo en cas d'erreur
        setSalesData(generateDemoData());
      }
    };

    fetchSalesData();
  }, [period]);

  // Fonction pour générer des données de démonstration
  const generateDemoData = () => {
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentMonth = new Date().getMonth();
    
    return Array(6).fill().map((_, idx) => {
      const monthIndex = (currentMonth - 5 + idx) % 12;
      const month = monthNames[monthIndex < 0 ? monthIndex + 12 : monthIndex];
      return {
        name: month,
        revenue: Math.round(1000 + Math.random() * 4000),
        orders: Math.round(10 + Math.random() * 50)
      };
    });
  };

  // Si aucune donnée n'est disponible, utiliser des données de démo
  const displayData = salesData.length > 0 ? salesData : generateDemoData();

  // Gérer le changement de période
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  if (loading && salesData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Revenus par période</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => handlePeriodChange('jour')}
            className={`px-2 py-1 text-xs rounded ${period === 'jour' ? 'bg-white text-primary' : 'bg-white/20 text-white'}`}
          >
            Jour
          </button>
          <button 
            onClick={() => handlePeriodChange('semaine')}
            className={`px-2 py-1 text-xs rounded ${period === 'semaine' ? 'bg-white text-primary' : 'bg-white/20 text-white'}`}
          >
            Semaine
          </button>
          <button 
            onClick={() => handlePeriodChange('mois')}
            className={`px-2 py-1 text-xs rounded ${period === 'mois' ? 'bg-white text-primary' : 'bg-white/20 text-white'}`}
          >
            Mois
          </button>
          <button 
            onClick={() => handlePeriodChange('annee')}
            className={`px-2 py-1 text-xs rounded ${period === 'annee' ? 'bg-white text-primary' : 'bg-white/20 text-white'}`}
          >
            Année
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={230}>
        <BarChart
          data={displayData}
          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff33" />
          <XAxis 
            dataKey="name"
            stroke="#ffffffaa"
            tick={{ fill: '#ffffffaa', fontSize: 12 }}
            tickLine={{ stroke: '#ffffff33' }}
          />
          <YAxis 
            stroke="#ffffffaa"
            tick={{ fill: '#ffffffaa', fontSize: 12 }}
            tickLine={{ stroke: '#ffffff33' }}
            tickFormatter={(value) => `${value} €`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#4A4A5C', 
              border: 'none',
              borderRadius: '4px',
              color: 'white'
            }} 
            formatter={(value, name) => {
              if (name === 'revenue') return [`${value.toLocaleString()} €`, 'Revenus'];
              if (name === 'orders') return [value, 'Commandes'];
              return [value, name];
            }}
          />
          <Legend 
            verticalAlign="top"
            height={36}
            formatter={(value) => {
              if (value === 'revenue') return 'Revenus';
              if (value === 'orders') return 'Commandes';
              return value;
            }}
          />
          <Bar 
            dataKey="revenue" 
            fill="#B39B84" 
            radius={[4, 4, 0, 0]} 
            name="revenue"
            barSize={20} 
          />
          <Bar 
            dataKey="orders" 
            fill="#ffffff88" 
            radius={[4, 4, 0, 0]} 
            name="orders"
            barSize={20}
            yAxisId={1}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;