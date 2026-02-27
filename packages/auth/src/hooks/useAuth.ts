"use client";

import { useState, useEffect } from "react";

// Stub for useAuth hook
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check auth status
  }, []);

  const login = async () => {
    console.log("Login logic");
  };

  const logout = async () => {
    console.log("Logout logic");
  };

  return {
    isAuthenticated,
    user,
    login,
    logout,
  };
};
