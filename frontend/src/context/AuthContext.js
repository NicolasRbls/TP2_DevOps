import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Configurer axios pour envoyer les cookies
  axios.defaults.withCredentials = true;
  
  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await axios.get('/api/auth/user');
        setUser(data.user);
      } catch (err) {
        // Ignorer les erreurs d'authentification ici
        console.log('Utilisateur non authentifié');
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);
  
  // Inscription
  const register = async (formData) => {
    try {
      setError(null);
      const { data } = await axios.post('/api/auth/register', formData);
      setUser(data.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue lors de l\'inscription');
      return false;
    }
  };
  
  // Connexion
  const login = async (formData) => {
    try {
      setError(null);
      const { data } = await axios.post('/api/auth/login', formData);
      setUser(data.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue lors de la connexion');
      return false;
    }
  };
  
  // Déconnexion
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    }
  };
  
  // Valeur du contexte
  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    setError
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};