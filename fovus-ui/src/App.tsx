import "./App.css";
import React, { ReactNode, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Navigate,
  Routes,
  BrowserRouter,
} from "react-router-dom";
import { Login } from "./aws/Login";
import { SignUp } from "./aws/SignUp";
import { Upload } from "./aws/Upload";
import { FOVUS_AUTHENTICATED, FOVUS_IDTOKEN } from "./aws/session.const";


// Private route for components which require authentication Public route for components which does not require quthentication.
export const App: React.FC = () => {
  return (
    <div className="w-screen h-screen flex">
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <Upload />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
    </div>
  );
};

interface RouteProps {
  children: ReactNode;
}

function PrivateRoute({ children }: RouteProps) {
  const isUserAuthenticated: boolean =
    !!sessionStorage.getItem(FOVUS_IDTOKEN) &&
    sessionStorage.getItem(FOVUS_AUTHENTICATED) == "true";
  // console.log("PrivateRoute");

  const [isAuthenticated, setIsAuthenticated] = useState(isUserAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
}

function PublicRoute({ children }: RouteProps) {
  const isUserAuthenticated: boolean =
    !!sessionStorage.getItem(FOVUS_IDTOKEN) &&
    sessionStorage.getItem(FOVUS_AUTHENTICATED) == "true";
  const [isAuthenticated, setIsAuthenticated] = useState(isUserAuthenticated);
  return isAuthenticated ? <Navigate to="/upload" /> : <>{children}</>;
}

export default App;
