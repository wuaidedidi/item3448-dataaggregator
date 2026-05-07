import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { loginApi } from '../api/auth'
import { BarChart3, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username.trim()) {
      toast.error('请输入用户名')
      return
    }
    if (!form.password) {
      toast.error('请输入密码')
      return
    }

    setLoading(true)
    try {
      const res = await loginApi(form)
      setAuth(res.data.token, res.data.user)
      toast.success('登录成功')
      navigate('/summary')
    } catch {
      // interceptor handles error display
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center space-x-3 mb-8">
            <BarChart3 className="w-10 h-10" />
            <span className="text-2xl font-bold">综合汇总系统</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            数据驱动决策
            <br />
            一键生成汇总
          </h1>
          <p className="text-lg text-blue-100 leading-relaxed max-w-md">
            支持多表跨表汇总、条件筛选、智能聚合，让复杂的数据分析变得简单高效。
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">3+</div>
              <div className="text-sm text-blue-200 mt-1">数据源支持</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-blue-200 mt-1">动态配置</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">&lt;3s</div>
              <div className="text-sm text-blue-200 mt-1">极速响应</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center space-x-3 mb-8 justify-center">
            <BarChart3 className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-800">综合汇总系统</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">欢迎回来</h2>
            <p className="text-gray-500 text-sm mb-8">请输入您的账号信息登录系统</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label-text">用户名</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="请输入用户名"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="label-text">密码</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="请输入密码"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    登录中...
                  </>
                ) : (
                  '登 录'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              还没有账号？{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                立即注册
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
