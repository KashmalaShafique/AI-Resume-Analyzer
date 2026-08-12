import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
axios.defaults.baseURL = 'https://ai-resume-analyzer-backend-three.vercel.app'

const AuthContext = createContext()

// Your deployed FastAPI backend
const API_URL = 'https://ai-resume-analyzer-backend-mala1.vercel.app'

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // Set Authorization header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/api/auth/me`)
          setUser(response.data)
        } catch (error) {
          console.error('Auth check failed:', error)
          localStorage.removeItem('token')
          setToken(null)
        }
      }

      setLoading(false)
    }

    checkAuth()
  }, [token])

  // LOGIN
  const login = async (username, password) => {
    try {
      // FastAPI OAuth2PasswordRequestForm expects
      // application/x-www-form-urlencoded
      const formData = new URLSearchParams()

      formData.append('username', username)
      formData.append('password', password)

      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )

      const { access_token } = response.data

      setToken(access_token)
      localStorage.setItem('token', access_token)

      // Set token immediately for this request
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

      // Get user information
      const userResponse = await axios.get(`${API_URL}/api/auth/me`)

      setUser(userResponse.data)

      return { success: true }

    } catch (error) {
      console.error('Login failed:', error)

      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed'
      }
    }
  }

  // REGISTER
  const register = async (username, email, password) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        {
          username,
          email,
          password,
        }
      )

      return {
        success: true,
        data: response.data
      }

    } catch (error) {
      console.error('Registration failed:', error)

      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed'
      }
    }
  }

  // LOGOUT
  const logout = () => {
    setUser(null)
    setToken(null)

    localStorage.removeItem('token')

    delete axios.defaults.headers.common['Authorization']
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}