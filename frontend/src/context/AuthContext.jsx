import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = sessionStorage.getItem('userToken');
        const userData = JSON.parse(sessionStorage.getItem('userData'));
        
        if (token && userData) {
          // Verify token validity with backend
          const response = await fetch('https://excel-analyzer-1.onrender.com/api/user/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            setUser(userData);
          } else {
            // Clear invalid session data
            sessionStorage.removeItem('userToken');
            sessionStorage.removeItem('userData');
            localStorage.removeItem('userToken');
            localStorage.removeItem('userData');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [])


  const register = (userData, token, rememberMe) => {

  const userDataWithPhone = {
    ...userData,
    phoneNumber: userData.phoneNumber
  };

  sessionStorage.setItem('userData', JSON.stringify(userDataWithPhone));
  sessionStorage.setItem('userToken', token);

  if (rememberMe) {
    localStorage.setItem('userData', JSON.stringify(userDataWithPhone));
    localStorage.setItem('userToken', token);
  }

  setUser(userDataWithPhone);
};
  const login = (userData, token, rememberMe) => {
    const userDataWithPhone = {
      ...userData,
      phoneNumber: userData.phoneNumber
    };

    // Always store in sessionStorage
    sessionStorage.setItem('userData', JSON.stringify(userDataWithPhone))
    sessionStorage.setItem('userToken', token)

    // Store in localStorage only if rememberMe is true
    if (rememberMe) {
      localStorage.setItem('userData', JSON.stringify(userDataWithPhone))
      localStorage.setItem('userToken', token)
    }
    setUser(userDataWithPhone)
  }

  const logout = () => {
    sessionStorage.removeItem('userData')
    sessionStorage.removeItem('userToken')
    localStorage.removeItem('userData')
    localStorage.removeItem('userToken')
    setUser(null)
  }

  const updateUser = (userData) => {
    const updatedData = {
      ...userData,
      phoneNumber: userData.phoneNumber
    };
    
    sessionStorage.setItem('userData', JSON.stringify(updatedData))
    if (localStorage.getItem('userData')) {
      localStorage.setItem('userData', JSON.stringify(updatedData))
    }
    setUser(updatedData)
  }

  if (loading) {
    return <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  }

  return (

    <AuthContext.Provider value={{ user,register, login, logout, updateUser, loading }}>

      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
