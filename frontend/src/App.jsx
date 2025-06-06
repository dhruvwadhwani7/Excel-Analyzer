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
import { useEffect } from 'react'

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

function App() {
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
          </Routes>
          <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
