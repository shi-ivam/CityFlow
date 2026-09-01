import React, { createContext, useContext, useState, useEffect } from 'react';
import { SEED_USERS } from '../db/seedData.js';
import { db } from '../db/transitDb.js';

const AuthContext = createContext(null);
const SESSION_KEY = 'cityflow_v2_auth_session';

export const ROLES = {
  ADMIN: 'ADMIN',
  DISPATCHER: 'DISPATCHER',
  OPERATOR: 'OPERATOR',
  VIEWER: 'VIEWER'
};

const ROLE_HIERARCHY = {
  ADMIN: 4,
  DISPATCHER: 3,
  OPERATOR: 2,
  VIEWER: 1
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse auth session:', e);
    }
    // Default to Lead Dispatcher for immediate productivity
    return SEED_USERS[1];
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = async (identifier, password) => {
    setIsLoading(true);
    // Simulate slight network auth delay
    await new Promise(r => setTimeout(r, 150));

    const user = SEED_USERS.find(
      u => (u.username.toLowerCase() === identifier.toLowerCase() || u.email.toLowerCase() === identifier.toLowerCase())
    );

    if (!user) {
      setIsLoading(false);
      return { success: false, error: 'User not registered in transport database.' };
    }

    if (user.password !== password) {
      setIsLoading(false);
      return { success: false, error: 'Invalid terminal password.' };
    }

    setCurrentUser(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    db.recordAuditLog({
      action: 'USER_LOGIN',
      entityType: 'auth',
      entityId: user.id,
      details: `User ${user.name} logged into terminal as ${user.role}`,
      newValue: { role: user.role, name: user.name },
      oldValue: null,
      actor: user.name,
      cityId: 'all'
    });

    setIsLoading(false);
    return { success: true, user };
  };

  const logout = () => {
    if (currentUser) {
      db.recordAuditLog({
        action: 'USER_LOGOUT',
        entityType: 'auth',
        entityId: currentUser.id,
        details: `User ${currentUser.name} signed out`,
        newValue: null,
        oldValue: null,
        actor: currentUser.name,
        cityId: 'all'
      });
    }
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const hasRole = (minimumRole) => {
    if (!currentUser) return false;
    const userLevel = ROLE_HIERARCHY[currentUser.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0;
    return userLevel >= requiredLevel;
  };

  const canPerformAction = (action) => {
    if (!currentUser) return false;
    switch (action) {
      case 'MANAGE_FLEET':
      case 'MANAGE_DRIVERS':
      case 'CONFIGURE_SYSTEM':
        return hasRole(ROLES.ADMIN);
      case 'SCHEDULE_TRIP':
      case 'REASSIGN_CREW':
      case 'RUN_SOLVER':
      case 'RESOLVE_CONFLICT':
        return hasRole(ROLES.DISPATCHER);
      case 'ACKNOWLEDGE_ALERT':
      case 'DISPATCH_TRIP':
        return hasRole(ROLES.OPERATOR);
      case 'VIEW_REPORTS':
      case 'EXPORT_DATA':
        return hasRole(ROLES.VIEWER);
      default:
        return true;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
        hasRole,
        canPerformAction,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

