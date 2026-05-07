import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Summary from './pages/Summary'
import Profile from './pages/Profile'
import UserManagement from './pages/UserManagement'
import DataView from './pages/DataView'

function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

function PublicRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  if (token) {
    return <Navigate to="/summary" replace />
  }
  return children
}

function AdminRoute({ children }) {
  const user = useAuthStore((s) => s.user)
  if (!user || user.role !== 'admin') {
    return <Navigate to="/summary" replace />
  }
  return children
}

export default function App() {
  return (
    <HashRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '8px',
            background: '#333',
            color: '#fff',
            fontSize: '14px',
          },
        }}
      />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/summary" replace />} />
          <Route path="summary" element={<Summary />} />
          <Route path="data-view" element={<DataView />} />
          <Route path="profile" element={<Profile />} />
          <Route path="users" element={<AdminRoute><UserManagement /></AdminRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </HashRouter>
  )
}
