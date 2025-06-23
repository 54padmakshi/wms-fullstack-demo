import React, { useState } from 'react';
import UploadForm from './components/UploadForm';
import DataTable from './components/DataTable';
import Dashboard from './components/Dashboard';

function App() {
 const [refresh, setRefresh] = useState(false);

const handleUpload = () => setRefresh(!refresh);
const handleClear = () => setRefresh(!refresh);

  return (
     <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      padding: '40px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>Warehouse Management Demo</h1>
     <UploadForm onUpload={handleUpload} onClear={handleClear} />
      <Dashboard key={refresh} />
      <DataTable key={refresh + 'table'} />
      <footer style={{ marginTop: '40px', color: '#888' }}>
        &copy; {new Date().getFullYear()} Warehouse Management Demo by Pallavi
      </footer>
    </div>
  );
}

export default App;
