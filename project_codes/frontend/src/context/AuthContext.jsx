import React, { createContext, useContext, useEffect, useState } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('lab_user')
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    if (user) localStorage.setItem('lab_user', JSON.stringify(user))
  }, [user])

  const login = async (email, password) => {
    const res = await client.post('/auth/login', { email, password })
    const data = res.data.data
    localStorage.setItem('lab_token', data.token)
    setUser(data)
    return data
  }

  const register = async (payload) => {
    const res = await client.post('/auth/register', payload)
    const data = res.data.data
    localStorage.setItem('lab_token', data.token)
    setUser(data)
    return data
  }

  const logout = () => {
    localStorage.removeItem('lab_token')
    localStorage.removeItem('lab_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
