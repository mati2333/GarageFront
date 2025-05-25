import React, { createContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = api.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const userData = await api.login(username, password);
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const register = async (username, email, password, roles, phoneNumber, workshopAddress) => {
    try {
      await api.register(username, email, password, roles, phoneNumber, workshopAddress);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };


