import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';



const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()


  const { register: authRegister } = useAuth();
  const validatePhoneNumber = (number) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(number);
  };

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validatePhoneNumber(formData.phoneNumber)) {
      toast.error('Please enter a valid Indian phone number');
      return;
    }

    setIsLoading(true)
    try {
      const dataToSend = {
        ...formData,
        phoneNumber: formData.phoneNumber // Backend will handle the +91 prefix
      };

      const response = await fetch('https://excel-analyzer-1.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      const data = await response.json()
      if (data.success && data.user && data.token) {
        authRegister(data.user, data.token, true);
        toast.success('Successfully registered!');
        navigate('/dashboard');
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-[#be185d] border-r-4 border-r-transparent"></div>
          <p className="mt-4 text-white text-lg">Creating your account...</p>
          <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-[#020617]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#be185d]/20 to-transparent opacity-90 animate-gradient" />

      <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fadeIn">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-[#0f172a] rounded-xl shadow-lg shadow-[#be185d]/10 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white">Create Account</h2>
              <p className="mt-2 text-gray-400">Join our community today</p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="text-white text-sm font-medium mb-1 block">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-[#1e293b] text-white border-none focus:ring-2 focus:ring-[#be185d]"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-white text-sm font-medium mb-1 block">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-[#1e293b] text-white border-none focus:ring-2 focus:ring-[#be185d]"
                    placeholder="Enter your email address"
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="text-white text-sm font-medium mb-1 block">Phone Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      +91
                    </span>
                    <input
                      id="phoneNumber"
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({ ...formData, phoneNumber: value });
                      }}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Phone number (10 digits)"
                      maxLength="10"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Enter 10 digit number without +91</p>
                </div>
                <div>
                  <label htmlFor="password" className="text-white text-sm font-medium mb-1 block"> Create Password</label>
                  
                  <input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-[#1e293b] text-white border-none focus:ring-2 focus:ring-[#be185d]"
                    placeholder="Enter your password"
                  />
                  <p className="mt-1 text-xs text-gray-500">Create Strong Password including special characters and numbers</p>
                </div>
                
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#be185d] text-white rounded-lg font-medium 
                hover:bg-[#be185d]/90 transition-all duration-300 transform hover:scale-105 
                hover:shadow-lg hover:shadow-[#be185d]/20"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>

              <div className="text-center mt-4">
                <p className="text-gray-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#be185d] hover:text-[#be185d]/80">
                    Sign in instead
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

export default Register
