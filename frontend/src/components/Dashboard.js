import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function Dashboard(refresh) {
  const [chartData, setChartData] = useState([]);

  const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://wms-backend-lna9.onrender.com'
    : 'http://localhost:5000';

  useEffect(() => {
    axios.get(`${BASE_URL}/api/sales/all`).then(res => {
      const count = {};
      res.data.forEach(row => {
        count[row.msku] = (count[row.msku] || 0) + row.quantity;
      });
      const chart = Object.entries(count).map(([msku, qty]) => ({ msku, qty }));
      setChartData(chart);
    });
  // To clear data on refresh (e.g., after Clear Page):
    return () => setChartData([]); }, [refresh, BASE_URL]);

  return (
    <BarChart width={800} height={400} data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="msku" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="qty" fill="#82ca9d" />
    </BarChart>
  );
}

export default Dashboard;
