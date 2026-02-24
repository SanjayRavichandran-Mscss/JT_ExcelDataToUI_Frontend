import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';      // adjust path as needed
import Home from './pages/Home';            // adjust path as needed
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'; // adjust path as needed

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          {/* Add more protected pages here later */}
        </Route>

        {/* Optional: redirect unknown paths to login */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;