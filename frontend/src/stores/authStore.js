import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),

  setAuth: (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ token, user })
  },

  updateUser: (userData) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    const merged = { ...currentUser, ...userData }
    localStorage.setItem('user', JSON.stringify(merged))
    set({ user: merged })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ token: null, user: null })
  },

  isLoggedIn: () => {
    return !!localStorage.getItem('token')
  },
}))
