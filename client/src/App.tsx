import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Transactions from './pages/Transactions';
import TaxCalculator from './pages/TaxCalculator';
import CibilAdvisor from './pages/CibilAdvisor';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/tax" element={<TaxCalculator />} />
            <Route path="/cibil" element={<CibilAdvisor />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Box>
      </Box>
    </AuthProvider>
  );
}

export default App;
