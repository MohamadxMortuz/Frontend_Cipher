import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }){
  const { user, loading } = useAuth();
  
  if(loading) {
    return (
      <div className="auth-wrapper">
        <div className="spinner" />
      </div>
    );
  }
  
  if(!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}