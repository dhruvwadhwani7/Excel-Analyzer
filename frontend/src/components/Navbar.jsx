
import { Link, useNavigate } from 'react-router-dom'
import { FaUserCircle, FaUserPlus, FaUpload, FaTachometerAlt } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import LogoImage from '../assets/Excel-Analyze-logo.png'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 backdrop-blur-sm bg-opacity-90 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16 text-white">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={LogoImage} alt="Excel Analyzer" className="h-8" />
            <span className="text-2xl font-semibold tracking-wide">Excel Analyzer</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-5 text-sm font-medium">
            <Link to="/features" className="hover:text-yellow-300 transition-all duration-300">
              Features
            </Link>
            <Link to="/upload" className="hover:text-yellow-300 flex items-center gap-1 transition-all duration-300">
              <FaUpload />
              Upload
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-1.5 rounded-full bg-white text-indigo-700 hover:bg-gray-100 transition-all duration-300 flex items-center gap-1"
                >
                  <FaTachometerAlt />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-300 text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Compact Auth Buttons */}
                <Link
                  to="/login"
                  className="px-4 py-1.5 rounded-full border border-white text-white font-medium hover:bg-white hover:text-indigo-700 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                    <FaUserCircle />
                    Sign In
                </Link>
                <Link
                   to="/register"
                   className="px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-indigo-900 font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                   <FaUserPlus />
                   Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar





