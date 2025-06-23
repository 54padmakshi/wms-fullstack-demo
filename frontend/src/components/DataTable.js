import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DataTable(refresh) {
  const [data, setData] = useState([]);

   useEffect(() => {
    // This must run every time component is mounted
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/sales/all');
        setData(res.data);
      
      } catch (err) {
        console.error('Failed to fetch sales data:', err);
      }
    }; fetchData();
return () => setData([]);  
}, [refresh]);

  return (
   
    <table border="1">
      <thead>
        <tr>
          
          <th>SKU</th>
          <th>MSKU</th>
          <th>Quantity</th>
         
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
           
            <td>{row.sku}</td>
            <td>{row.msku}</td>
            <td>{row.quantity}</td>
            
          </tr>
        ))}
      </tbody>
    </table>
   
  );
}

export default DataTable;
