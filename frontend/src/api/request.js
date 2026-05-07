import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../stores/authStore'

const recentMessages = new Set()

const showError = (message) => {
  if (!message || recentMessages.has(message)) return
  recentMessages.add(message)
  setTimeout(() => recentMessages.delete(message), 2000)
  toast.error(message)
}

const request = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

request.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 200) {
      showError(res.message || '操作失败')
      const error = new Error(res.message)
      error._isBusinessError = true
      return Promise.reject(error)
    }
    return res
  },
  (error) => {
    if (error._isBusinessError) {
      return Promise.reject(error)
    }

    if (error.response) {
      const { status, data } = error.response
      const message = data?.message

      if (status === 401) {
        showError('登录已过期，请重新登录')
        useAuthStore.getState().logout()
        window.location.hash = '#/login'
        return Promise.reject(error)
      }

      if (status === 403) {
        showError(message || '权限不足')
        return Promise.reject(error)
      }

      showError(message || '服务器错误，请稍后重试')
    } else if (error.request) {
      showError('网络错误，请检查网络连接')
    }

    return Promise.reject(error)
  }
)

export default request
