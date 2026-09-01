import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext.jsx';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ProtectedRoute({ children, requiredRole = ROLES.VIEWER }) {
  const { currentUser, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasRole(requiredRole)) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-card border border-rose-500/30 rounded-xl p-6 shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Access Restricted</h2>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Your role <span className="text-primary font-bold">{currentUser.role}</span> does not have sufficient operational clearance to access this terminal section.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-mono text-xs font-semibold flex items-center space-x-2 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Permitted Section</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

