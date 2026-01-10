import { useEffect, useState, useRef } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Toaster, toast } from 'sonner';
import process from 'process';

//Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const API = `${BACKEND_URL}/api`;

// Create axios instance with credentials
const api = axios.create({
  // baseURL: API,
  baseURL: "http://localhost:3500",
  withCredentials: true
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AuthCallback = () => {
  const hasProcessed = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      const hash = location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);

      if (sessionIdMatch) {
        const sessionId = sessionIdMatch[1];

        try {
          const response = await api.post("/auth/session", { session_id: sessionId });
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          toast.success("Welcome to Asset Forge!");
          navigate("/dashboard", { replace: true, state: { user: response.data.user } });
        } catch (error) {
          console.error("Auth error:", error);
          toast.error("Authentication failed");
          navigate("/login", { replace: true });
        }
      } else {
        navigate("/login", { replace: true });
      }
    };

    processAuth();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Authenticating...</p>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Skip if user data passed from AuthCallback
    if (location.state?.user) {
      setUser(location.state.user);
      setIsAuthenticated(true);
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        navigate("/login", { replace: true });
      }
    };

    checkAuth();
  }, [navigate, location.state]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children({ user, api });
};

function AppRouter() {
  const location = useLocation();

  // Check URL fragment for session_id synchronously during render
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage api={api} />} />
      <Route path="/register" element={<RegisterPage api={api} />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {({ user, api }) => <Dashboard user={user} api={api} />}
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </div>
  );
}

export default App;
