import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerApi } from '../api/auth'
import { BarChart3, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    email: '',
    phone: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    if (!form.username.trim()) { toast.error('请输入用户名'); return false }
    if (form.username.trim().length < 3) { toast.error('用户名长度不能少于3个字符'); return false }
    if (!form.password) { toast.error('请输入密码'); return false }
    if (form.password.length < 6) { toast.error('密码长度不能少于6个字符'); return false }
    if (form.password !== form.confirmPassword) { toast.error('两次密码输入不一致'); return false }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error('邮箱格式不正确'); return false
    }
    if (form.phone && !/^1[3-9]\d{9}$/.test(form.phone)) {
      toast.error('手机号格式不正确'); return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      await registerApi({
        username: form.username.trim(),
        password: form.password,
        nickname: form.nickname.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      })
      toast.success('注册成功，请登录')
      navigate('/login')
    } catch {
      // interceptor handles error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="flex items-center space-x-3 mb-8 justify-center">
          <BarChart3 className="w-8 h-8 text-primary-600" />
          <span className="text-xl font-bold text-gray-800">综合汇总系统</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">创建账号</h2>
          <p className="text-gray-500 text-sm mb-6">填写以下信息完成注册</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">用户名 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="3-20个字符"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
              <div>
                <label className="label-text">昵称</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="选填"
                  value={form.nickname}
                  onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label-text">密码 <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="至少6个字符"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="label-text">确认密码 <span className="text-red-500">*</span></label>
              <input
                type="password"
                className="input-field"
                placeholder="再次输入密码"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">邮箱</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="选填"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="label-text">手机号</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="选填"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  注册中...
                </>
              ) : (
                '注 册'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            已有账号？{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              返回登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
