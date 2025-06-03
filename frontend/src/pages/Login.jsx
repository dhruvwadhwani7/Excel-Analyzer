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
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        login(data.user, data.token, rememberMe)
        toast.success('Successfully logged in!')

        // Handle redirect
        const redirectUrl =
          location.state?.from ||
          sessionStorage.getItem('redirectUrl') ||
          '/'
        sessionStorage.removeItem('redirectUrl') // Clean up
        navigate(redirectUrl)
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
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
