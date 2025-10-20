'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { User, UserRole } from '@prisma/client'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  clearError: () => void
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: UserRole
  department: string
  bio?: string
  skills?: string[]
  interests?: string[]
  gpa?: number
  year?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const initialState: AuthState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  loading: true,
  error: null
}

type AuthAction =
  | { type: 'LOGIN_START' | 'REGISTER_START' }
  | { type: 'LOGIN_SUCCESS' | 'REGISTER_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' | 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'LOAD_USER_SUCCESS'; payload: User }
  | { type: 'LOAD_USER_FAILURE' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' }

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        loading: true,
        error: null
      }
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token)
      }
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      }
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      }
    case 'LOGOUT':
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null
      }
    case 'LOAD_USER_SUCCESS':
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null
      }
    case 'LOAD_USER_FAILURE':
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    default:
      return state
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      if (state.token) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${state.token}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            dispatch({ type: 'LOAD_USER_SUCCESS', payload: data.data.user })
          } else {
            dispatch({ type: 'LOAD_USER_FAILURE' })
          }
        } catch (error) {
          dispatch({ type: 'LOAD_USER_FAILURE' })
        }
      } else {
        dispatch({ type: 'LOAD_USER_FAILURE' })
      }
    }

    loadUser()
  }, [state.token])

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        // Set cookie for server-side auth
        const cookieParts = [
          `auth-token=${data.data.token}`,
          'path=/',
          `max-age=${7 * 24 * 60 * 60}`,
          'samesite=lax'
        ]

        if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
          cookieParts.push('secure')
        }

        document.cookie = cookieParts.join('; ')
        dispatch({ type: 'LOGIN_SUCCESS', payload: data.data })
        return { success: true }
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: data.error || 'Login failed' })
        return { success: false, error: data.error || 'Login failed' }
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Login failed' })
      return { success: false, error: 'Login failed' }
    }
  }

  const register = async (userData: RegisterData) => {
    dispatch({ type: 'REGISTER_START' })
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (response.ok) {
        // Set cookie for server-side auth
        const cookieParts = [
          `auth-token=${data.data.token}`,
          'path=/',
          `max-age=${7 * 24 * 60 * 60}`,
          'samesite=lax'
        ]

        if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
          cookieParts.push('secure')
        }

        document.cookie = cookieParts.join('; ')
        dispatch({ type: 'REGISTER_SUCCESS', payload: data.data })
        return { success: true }
      } else {
        dispatch({ type: 'REGISTER_FAILURE', payload: data.error || 'Registration failed' })
        return { success: false, error: data.error || 'Registration failed' }
      }
    } catch (error) {
      dispatch({ type: 'REGISTER_FAILURE', payload: 'Registration failed' })
      return { success: false, error: 'Registration failed' }
    }
  }

  const logout = () => {
    // Clear cookie
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    dispatch({ type: 'LOGOUT' })
  }

  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData })
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
