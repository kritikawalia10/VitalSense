import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { token, role, name, id }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Session restoration disabled to ensure landing on login page
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('role', userData.role);
    if (userData.name) localStorage.setItem('name', userData.name);
    if (userData.id) localStorage.setItem('id', userData.id);
    if (userData.patientId) localStorage.setItem('patientId', userData.patientId);
    
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('id');
    localStorage.removeItem('patientId');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
