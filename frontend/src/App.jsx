import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Analytics from './pages/Analytics'
import AdminDashboard from './pages/AdminDashboard'
import { useEffect, useState } from 'react'
import DynamicCmsPage from './pages/cmspage/DynamicXmsPage'
import Charts from './pages/Charts'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  useEffect(() => {
    // Save the attempted URL
    if (!user && !loading) {
      sessionStorage.setItem('redirectUrl', location.pathname)
    }
  }, [user, loading, location])

  if (loading) {
    return <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} />
  }

  return children
}

// Add an AdminRoute component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    // Check authentication state on app load
    const checkAuth = async () => {
      const token = sessionStorage.getItem('userToken');
      const userData = JSON.parse(sessionStorage.getItem('userData'));
      
      if (token && userData) {
        try {
          const response = await fetch('https://excel-analyzer-1.onrender.com/api/user/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            // Clear invalid session
            sessionStorage.removeItem('userToken');
            sessionStorage.removeItem('userData');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }
      setAuthChecked(true);
    };

    checkAuth();
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-[#be185d] border-r-4 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#020617]">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route path="/:slug" element={<DynamicCmsPage />} />
            <Route
              path="/charts"
              element={
                <ProtectedRoute>
                  <Charts />
                </ProtectedRoute>
              }
            />
          </Routes>
          <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
