import { Link, useNavigate } from 'react-router-dom'
import {
  FaUserCircle, FaUserPlus, FaChartLine, FaFileUpload,
  FaHome, FaCheck, FaTimes, FaChartBar, FaBars
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
    setIsMobileMenuOpen(false)
  }

  const handleLogoutConfirm = () => {
    logout()
    setShowLogoutModal(false)
    navigate('/')
  }

  const handleLogoutCancel = () => {
    setShowLogoutModal(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      <nav className="bg-[#0f172a] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 ">
          <div className="flex justify-between h-16 items-center">
            {/* Left section with logo */}
            <div className="flex items-center space-x-4">
              <Link to={user?.role === 'admin' ? "/admin" : "/"} className="flex items-center">
                <span className="text-xl font-bold text-white hover:text-[#be185d] transition-colors">
                  Excel Analyzer
                </span>
              </Link>
              {/* Desktop Nav (hidden on small screens) */}
              <div className="hidden lg:flex items-center space-x-4">
                {user && user.role !== 'admin' && (
                  <>
                    <Link to="/dashboard" className="flex items-center px-4 py-2 rounded-md text-white hover:text-[#be185d] transition-colors">
                      <FaHome className="mr-2" /> Home
                    </Link>
                    <Link to="/analytics" className="flex items-center px-4 py-2 rounded-md text-white hover:text-[#be185d] transition-colors">
                      <FaChartBar className="mr-2" /> Analytics
                    </Link>
                    <Link to="/upload" className="flex items-center px-4 py-2 rounded-md bg-[#be185d] text-white hover:bg-[#be185d]/90 transition-all transform hover:scale-105">
                      <FaFileUpload className="mr-2" /> Upload File
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right section */}
            <div className="hidden lg:flex items-center space-x-4">
              {user ? (
                <>
                  {user.role !== 'admin' && (
                    <>
                      <Link to="/dashboard" className="flex items-center px-4 py-2 rounded-md text-white hover:text-[#be185d] transition-colors">
                        <FaChartLine className="mr-2" /> Dashboard
                      </Link>
                      <Link to="/profile" className="flex items-center px-4 py-2 rounded-md text-white hover:text-[#be185d] transition-colors">
                        <FaUserCircle className="mr-2" /> Profile
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogoutClick}
                    className="flex items-center px-4 py-2 rounded-md border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="flex items-center px-6 py-2 rounded-md text-white hover:text-[#be185d] transition-colors">
                    <FaUserCircle className="mr-2" /> Sign In
                  </Link>
                  <Link to="/register" className="flex items-center px-6 py-2 rounded-md bg-[#be185d] text-white hover:bg-[#be185d]/90 transition-all transform hover:scale-105">
                    <FaUserPlus className="mr-2" /> Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="lg:hidden">
              <button onClick={toggleMobileMenu} className="text-white text-xl">
                {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden flex flex-col space-y-2 pb-4">
              {user && user.role !== 'admin' && (
                <>
                  <Link to="/dashboard" onClick={toggleMobileMenu} className="text-white px-4 py-2 hover:text-[#be185d]">
                    <FaHome className="inline mr-2" /> Home
                  </Link>
                  <Link to="/analytics" onClick={toggleMobileMenu} className="text-white px-4 py-2 hover:text-[#be185d]">
                    <FaChartBar className="inline mr-2" /> Analytics
                  </Link>
                  <Link to="/upload" onClick={toggleMobileMenu} className="text-white px-4 py-2 hover:text-[#be185d]">
                    <FaFileUpload className="inline mr-2" /> Upload File
                  </Link>
                </>
              )}
              {user ? (
                <>
                  {user.role !== 'admin' && (
                    <>
                      <Link to="/dashboard" onClick={toggleMobileMenu} className="text-white px-4 py-2 hover:text-[#be185d]">
                        <FaChartLine className="inline mr-2" /> Dashboard
                      </Link>
                      <Link to="/profile" onClick={toggleMobileMenu} className="text-white px-4 py-2 hover:text-[#be185d]">
                        <FaUserCircle className="inline mr-2" /> Profile
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogoutClick}
                    className="flex items-center w-fit ml-[17px] px-4 py-2 rounded-md border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={toggleMobileMenu} className="text-white px-4 py-2 hover:text-[#be185d]">
                    <FaUserCircle className="inline mr-2" /> Sign In
                  </Link>
                  <Link to="/register" onClick={toggleMobileMenu} className="text-white px-4 py-2 hover:text-[#be185d]">
                    <FaUserPlus className="inline mr-2" /> Sign Up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#0f172a] rounded-xl p-6 max-w-sm w-full mx-4 animate-fadeIn">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Logout</h3>
            <p className="text-gray-400 mb-6">Are you sure you want to logout?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleLogoutCancel}
                className="flex items-center px-4 py-2 rounded-md bg-[#1e293b] text-white hover:bg-[#1e293b]/80 transition-all"
              >
                <FaTimes className="mr-2" /> No, Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex items-center px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-all"
              >
                <FaCheck className="mr-2" /> Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
