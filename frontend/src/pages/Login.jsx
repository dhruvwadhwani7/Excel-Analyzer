import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ identifier: '', password: '' })
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('https://excel-analyzer-1.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        login(data.user, data.token, rememberMe)
        toast.success('Successfully logged in!')

        // Handle role-based redirect
        if (data.user.role === 'admin') {
          navigate('/admin')
        } else {
          const redirectUrl =
            location.state?.from ||
            sessionStorage.getItem('redirectUrl') ||
            '/'
          sessionStorage.removeItem('redirectUrl') // Clean up
          navigate(redirectUrl)
        }
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-[#be185d] border-r-4 border-r-transparent"></div>
          <p className="mt-4 text-white text-lg">Logging you in...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we verify your credentials</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-[#020617]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#be185d]/20 to-transparent opacity-90 animate-gradient" />
      
      <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fadeIn">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-[#0f172a] rounded-xl shadow-lg shadow-[#be185d]/10 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
              <p className="mt-2 text-gray-400">Sign in to your account</p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="identifier" className="text-white text-sm font-medium mb-1 block">Email or Phone number</label>
                  <p className="text-xs text-gray-400 mb-2">For phone numbers, enter without +91</p>
                  
                  <input
                    id="identifier"
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#1e293b] text-white border-none focus:ring-2 focus:ring-[#be185d]"
                    placeholder="Enter your email or phone"
                    value={formData.identifier}
                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="text-white text-sm font-medium mb-1 block">Password</label>
                  <input
                    id="password"
                    type="password"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#1e293b] text-white border-none focus:ring-2 focus:ring-[#be185d]"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 bg-[#1e293b] border-none rounded focus:ring-[#be185d] text-[#be185d]"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-gray-400">
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-3 bg-[#be185d] text-white rounded-lg font-medium 
                hover:bg-[#be185d]/90 transition-all duration-300 transform hover:scale-105 
                hover:shadow-lg hover:shadow-[#be185d]/20"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>

              <div className="text-center mt-4">
                <p className="text-gray-400">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-[#be185d] hover:text-[#be185d]/80">
                    Create one now
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Test Credentials Section */}
          <div className="bg-[#1e293b] rounded-xl p-6 shadow-lg shadow-[#be185d]/10 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Test Credentials</h3>
              <span className="text-xs text-[#be185d] bg-[#be185d]/10 px-2 py-1 rounded-full">
                Click to Copy
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="border-b border-gray-700 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#be185d] font-medium">Admin Access</span>
                  <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">Role: Administrator</span>
                </div>
                <div 
                  className="space-y-1 cursor-pointer hover:bg-[#0f172a] p-2 rounded transition-all"
                  onClick={() => {
                    navigator.clipboard.writeText('admin@gmail.com');
                    toast.info('Email copied to clipboard');
                  }}
                >
                  <p className="text-gray-400 text-sm flex justify-between">
                    <span>Email:</span>
                    <span className="text-white">admin@gmail.com</span>
                  </p>
                </div>
                <div 
                  className="space-y-1 cursor-pointer hover:bg-[#0f172a] p-2 rounded transition-all"
                  onClick={() => {
                    navigator.clipboard.writeText('admin123');
                    toast.info('Password copied to clipboard');
                  }}
                >
                  <p className="text-gray-400 text-sm flex justify-between">
                    <span>Password:</span>
                    <span className="text-white">admin123</span>
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#be185d] font-medium">Regular User Access</span>
                  <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">Role: User</span>
                </div>
                <div 
                  className="space-y-1 cursor-pointer hover:bg-[#0f172a] p-2 rounded transition-all"
                  onClick={() => {
                    navigator.clipboard.writeText('test@gmail.com');
                    toast.info('Email copied to clipboard');
                  }}
                >
                  <p className="text-gray-400 text-sm flex justify-between">
                    <span>Email:</span>
                    <span className="text-white">test@gmail.com</span>
                  </p>
                </div>
                <div 
                  className="space-y-1 cursor-pointer hover:bg-[#0f172a] p-2 rounded transition-all"
                  onClick={() => {
                    navigator.clipboard.writeText('test123');
                    toast.info('Password copied to clipboard');
                  }}
                >
                  <p className="text-gray-400 text-sm flex justify-between">
                    <span>Password:</span>
                    <span className="text-white">test123</span>
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-500 text-center">
              Click on credentials to copy to clipboard
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default Login
