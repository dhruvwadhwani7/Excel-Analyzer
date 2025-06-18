
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaUser, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const validatePhoneNumber = (number) => {
    const phoneRegex = /^[6-9]\d{9}$/
    return phoneRegex.test(number)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validatePhoneNumber(formData.phoneNumber)) {
      toast.error('Please enter a valid Indian phone number')
      return
    }

    setIsLoading(true)
    try {
      const dataToSend = {
        ...formData,
        phoneNumber: formData.phoneNumber, // Backend will handle +91 prefix
      }

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Registration successful. Please log in.')
        navigate('/login')
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 px-6 py-12">
      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-semibold text-center text-indigo-900 mb-3">
          Create Your Account
        </h2>
        <p className="text-center text-sm text-gray-600 mb-8">
          Complete the form below to register.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            {/* Name */}
            <div className="relative">
              <FaUser className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                required
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md
                  placeholder-gray-400 text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition duration-300 ease-in-out"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md
                  placeholder-gray-400 text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition duration-300 ease-in-out"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="sr-only">Phone Number</label>
              <div className="flex rounded-md shadow-sm">
                <span
                  className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm select-none"
                  aria-hidden="true"
                >
                  +91
                </span>
                <input
                  type="tel"
                  required
                  placeholder="Phone Number (10 digits)"
                  maxLength={10}
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setFormData({ ...formData, phoneNumber: value })
                  }}
                  className="flex-1 block w-full rounded-r-md border border-gray-300
                    placeholder-gray-400 text-gray-900 py-2 px-3
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    transition duration-300 ease-in-out"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Enter your 10-digit mobile number without the +91 prefix.</p>
            </div>

            {/* Password */}
            <div className="relative">
              <FaLock className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="password"
                required
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md
                  placeholder-gray-400 text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition duration-300 ease-in-out"
              />
              <p className="mt-1 text-xs text-gray-500">
                Use 8 or more characters with a mix of letters, numbers & symbols.
              </p>
            </div>
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
            {isLoading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Register
