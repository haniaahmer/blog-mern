import React from "react";
import { Navigate } from "react-router-dom";

// Protects admin routes
export const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("adminToken");
  return isAuthenticated ? children :  <Navigate to="/admin/login" replace />;
};

// Redirects authenticated admins away from login page
export const AuthRedirectRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("adminToken");
  return isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : children;
};