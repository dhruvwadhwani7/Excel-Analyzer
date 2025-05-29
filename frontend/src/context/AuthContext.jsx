import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check sessionStorage first
    const sessionUser = JSON.parse(sessionStorage.getItem('userData'))
    if (sessionUser) {
      setUser(sessionUser)
      return
    }

    // If not in session, check localStorage
    const localUser = JSON.parse(localStorage.getItem('userData'))
    if (localUser) {
      // If found in localStorage, also set in sessionStorage
      sessionStorage.setItem('userData', JSON.stringify(localUser))
      sessionStorage.setItem('userToken', localStorage.getItem('userToken'))
      setUser(localUser)
    }
  }, [])

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

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
