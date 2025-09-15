import React from "react";
import type { ReactNode } from "react";
import { Spin } from "antd";
import { useAuth } from "../../../contexts/useAuth";
import Login from "../../auth/Login";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  console.debug(
    "[ProtectedRoute] render isLoading:",
    isLoading,
    "isAuthenticated:",
    isAuthenticated
  );

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
