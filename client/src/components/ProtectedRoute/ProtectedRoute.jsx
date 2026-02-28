// import React from 'react';
// import { Navigate, Outlet } from 'react-router-dom';

// const ProtectedRoute = () => {
//   const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

//   return isLoggedIn ? <Outlet /> : <Navigate to="/" replace />;
// };

// export default ProtectedRoute;












// ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  // If no token → redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Has token → show the protected page
  return <Outlet />;
};

export default ProtectedRoute;