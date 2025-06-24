import React, { useState } from 'react';
import axios from 'axios';

const UploadForm = ({ onUpload, onClear }) => {
  const [file, setFile] = useState(null);

  
const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://wms-backend-lna9.onrender.com'
    : 'http://localhost:5000';

 const handleUpload = async () => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await axios.post(`${BASE_URL}/api/sales/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
        }

    });

    alert(`✅ Upload complete. Rows uploaded: ${res.data.count}`);
    console.log('Upload response:', res.data);
    if (res.data.tooManyUnmapped) {
      alert(`⚠️ Warning: More than 20% of SKUs were not mapped!`);
    }

    if (res.data.missingMappings?.length) {
      console.log('Unmapped SKUs:', res.data.missingMappings);
      // You could also show them in a modal or download as CSV
    }

    onUpload();
  } catch (err) {
    console.error('Upload failed:', err);
    alert('❌ Upload failed. Please check the file and try again.');
  }
};


  const handleClear = async () => {
    try {
     await axios.delete(`${BASE_URL}/api/sales/clear`);
      onClear(); // Trigger refresh after delete
    } catch (err) {
      console.error('Clear failed:', err);
      alert('Failed to clear data');
    }
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <input type="file"  accept=".csv, .xlsx" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Click to See the Sale Files</button>
      <button onClick={handleClear} style={{ marginLeft: '12px' }}>Clear Page</button>
    </div>
  );
};

export default UploadForm;  