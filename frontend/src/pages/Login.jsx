
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { FaLock, FaUser } from 'react-icons/fa'

const Login = () => {
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ identifier: '', password: '' })
  const navigate = useNavigate()
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
        toast.success('Successfully logged in.')
        navigate('/')
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast.error(error.message || 'Login attempt failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 px-6 py-12">
      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-semibold text-center text-indigo-900 mb-3">
          Sign In to Your Account
        </h2>
        <p className="text-center text-sm text-gray-600 mb-8">
          Please enter your credentials to access your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div className="relative">
              <FaUser className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                required
                placeholder="Email Address or Phone Number"
                value={formData.identifier}
                onChange={(e) =>
                  setFormData({ ...formData, identifier: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md
                  placeholder-gray-400 text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition duration-300 ease-in-out"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your registered email or 10-digit phone number.
              </p>
            </div>

            <div className="relative">
              <FaLock className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="password"
                required
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md
                  placeholder-gray-400 text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition duration-300 ease-in-out"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-gray-700 text-sm">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded
                  transition duration-200 ease-in-out"
              />
              <span>Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:underline transition duration-200 ease-in-out"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-700 to-purple-700
              rounded-md text-white font-semibold text-lg shadow-md
              hover:from-blue-800 hover:to-purple-800
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600
              transition duration-300 ease-in-out"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="text-blue-600 hover:underline font-medium transition duration-200 ease-in-out"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login

