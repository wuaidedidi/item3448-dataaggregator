import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { updateProfileApi, changePasswordApi } from '../api/auth'
import { User, Mail, Phone, Lock, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('info')

  const [profileForm, setProfileForm] = useState({
    nickname: user?.nickname || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const validateProfile = () => {
    if (profileForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      toast.error('邮箱格式不正确')
      return false
    }
    if (profileForm.phone && !/^1[3-9]\d{9}$/.test(profileForm.phone)) {
      toast.error('手机号格式不正确')
      return false
    }
    return true
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!validateProfile()) return

    setProfileLoading(true)
    try {
      const res = await updateProfileApi(profileForm)
      updateUser(res.data)
      toast.success('个人信息更新成功')
    } catch {
      // interceptor handles
    } finally {
      setProfileLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!passwordForm.oldPassword) { toast.error('请输入原密码'); return }
    if (!passwordForm.newPassword) { toast.error('请输入新密码'); return }
    if (passwordForm.newPassword.length < 6) { toast.error('新密码长度不能少于6个字符'); return }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('两次密码输入不一致'); return
    }

    setPasswordLoading(true)
    try {
      await changePasswordApi({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      })
      toast.success('密码修改成功')
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch {
      // interceptor handles
    } finally {
      setPasswordLoading(false)
    }
  }

  const tabs = [
    { key: 'info', label: '个人信息', icon: User },
    { key: 'password', label: '修改密码', icon: Lock },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">个人中心</h1>
        <p className="text-sm text-gray-500 mt-1">管理您的个人信息和账号安全</p>
      </div>

      {/* User card */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user?.nickname || user?.username}</h2>
            <div className="flex items-center space-x-3 mt-1">
              <span className="text-sm text-gray-500">@{user?.username}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                user?.role === 'admin'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {user?.role === 'admin' ? '管理员' : '普通用户'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card !p-0">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'info' && (
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="label-text">用户名</label>
                <input
                  type="text"
                  className="input-field bg-gray-50"
                  value={user?.username || ''}
                  disabled
                />
                <p className="text-xs text-gray-400 mt-1">用户名不可修改</p>
              </div>

              <div>
                <label className="label-text">昵称</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    className="input-field pl-10"
                    placeholder="请输入昵称"
                    value={profileForm.nickname}
                    onChange={(e) => setProfileForm({ ...profileForm, nickname: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label-text">邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    className="input-field pl-10"
                    placeholder="选填，如：example@email.com"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label-text">手机号</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    className="input-field pl-10"
                    placeholder="选填，如：13800138000"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={profileLoading} className="btn-primary">
                  {profileLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />保存中...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" />保存修改</>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label className="label-text">原密码 <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="请输入原密码"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                />
              </div>

              <div>
                <label className="label-text">新密码 <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="至少6个字符"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
              </div>

              <div>
                <label className="label-text">确认新密码 <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="再次输入新密码"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={passwordLoading} className="btn-primary">
                  {passwordLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />修改中...</>
                  ) : (
                    <><Lock className="w-4 h-4 mr-2" />修改密码</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
