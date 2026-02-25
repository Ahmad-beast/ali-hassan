import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { currentUser, userProfile, loading } = useAuth();

  // Agar Firebase auth ka status check ho raha hai
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  // Agar user logged in hi nahi hai, toh login par bhejein
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // 🔴 FIX YAHAN HAI: Agar user logged in hai par Firestore se profile data aane mein time lag raha hai
  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div className="text-lg text-gray-600">Loading Profile...</div>
        </div>
      </div>
    );
  }

  // Admin access check
  if (requireAdmin && userProfile.role !== 'admin') {
    return <Navigate to="/transactions" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
