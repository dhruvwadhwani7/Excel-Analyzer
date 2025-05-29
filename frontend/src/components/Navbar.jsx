import { Link, useNavigate } from 'react-router-dom'
import { FaUserCircle, FaUserPlus } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import LogoImage from '../assets/Excel-Analyze-logo.png' // Add this import

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src={LogoImage} alt="Excel Analyzer" className="h-8 w-auto" />
              <span className="ml-2 text-xl font-bold text-gray-800">Excel Analyzer</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <FaUserCircle className="h-6 w-6" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100">
                  <FaUserCircle className="mr-2" />
                  Sign In
                </Link>
                <Link to="/register" className="flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                  <FaUserPlus className="mr-2" />
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
