import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthChanged,
  signUpUser,
  signInUser,
  signInGoogle,
  signOutUser
} from '../services/firebase';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync Firebase authentication with database profile records
  useEffect(() => {
    const unsubscribe = onAuthChanged(async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);

          // Configure default Axios header with verified Bearer token
          api.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;

          // Fetch user profile from Mongoose database (automatically provisions profile if new user)
          const response = await api.get('/auth/profile');
          
          // Merge Firebase credentials and custom database attributes (like role, id)
          setUser({
            ...firebaseUser,
            ...response.data.data
          });
        } catch (error) {
          console.error('Failed to sync authentication details with profile:', error.message);
          setUser(null);
          setToken(null);
          delete api.defaults.headers.common['Authorization'];
        }
      } else {
        setUser(null);
        setToken(null);
        delete api.defaults.headers.common['Authorization'];
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = (email, password) => {
    return signUpUser(email, password);
  };

  const login = (email, password) => {
    return signInUser(email, password);
  };

  const loginWithGoogle = () => {
    return signInGoogle();
  };

  const logout = () => {
    return signOutUser();
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const response = await api.get('/auth/profile');
        setUser((prev) => ({
          ...prev,
          ...response.data.data
        }));
      } catch (error) {
        console.error('Failed to refresh user profile:', error.message);
      }
    }
  };

  const value = {
    user,
    token,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
