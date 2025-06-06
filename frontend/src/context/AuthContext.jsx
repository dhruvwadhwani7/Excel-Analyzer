import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = () => {
      // Try to get auth data from sessionStorage first
      const sessionUser = JSON.parse(sessionStorage.getItem('userData'))
      const sessionToken = sessionStorage.getItem('userToken')
      
      if (sessionUser && sessionToken) {
        setUser(sessionUser)
        setLoading(false)
        return
      }

      // If not in session, check localStorage
      const localUser = JSON.parse(localStorage.getItem('userData'))
      const localToken = localStorage.getItem('userToken')
      
      if (localUser && localToken) {
        // Restore to session storage
        sessionStorage.setItem('userData', JSON.stringify(localUser))
        sessionStorage.setItem('userToken', localToken)
        setUser(localUser)
      }
      
      setLoading(false)
    }

    initializeAuth()
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
    <AuthContext.Provider value={{ user, register,login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
