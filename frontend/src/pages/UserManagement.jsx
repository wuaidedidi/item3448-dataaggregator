import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { getUsersApi, updateUserApi, deleteUserApi } from '../api/users'
import ConfirmModal from '../components/ConfirmModal'
import { Users, Edit3, Trash2, Loader2, X, Save, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UserManagement() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [editModal, setEditModal] = useState({ open: false, user: null })
  const [editForm, setEditForm] = useState({})
  const [editLoading, setEditLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, user: null })
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [page])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await getUsersApi({ page, pageSize: 10 })
      setUsers(res.data.items || [])
      setTotal(res.data.total || 0)
      setTotalPages(res.data.totalPages || 1)
    } catch { /* interceptor */ }
    finally { setLoading(false) }
  }

  const openEditModal = (u) => {
    setEditForm({
      nickname: u.nickname || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || 'user',
      status: u.status ?? 1,
    })
    setEditModal({ open: true, user: u })
  }

  const handleUpdate = async () => {
    const u = editModal.user
    if (!u) return

    if (editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      toast.error('邮箱格式不正确'); return
    }
    if (editForm.phone && !/^1[3-9]\d{9}$/.test(editForm.phone)) {
      toast.error('手机号格式不正确'); return
    }

    setEditLoading(true)
    try {
      await updateUserApi(u.id, editForm)
      toast.success('用户信息更新成功')
      if (isSelf(u)) {
        useAuthStore.getState().updateUser(editForm)
      }
      setEditModal({ open: false, user: null })
      loadUsers()
    } catch { /* interceptor */ }
    finally { setEditLoading(false) }
  }

  const handleDelete = async () => {
    const u = deleteConfirm.user
    if (!u || deleteLoading) return
    setDeleteLoading(true)
    try {
      await deleteUserApi(u.id)
      toast.success('用户删除成功')
      setDeleteConfirm({ open: false, user: null })
      if (users.length <= 1 && page > 1) {
        setPage(page - 1)
      } else {
        loadUsers()
      }
    } catch { /* interceptor */ }
    finally { setDeleteLoading(false) }
  }

  const isSelf = (u) => currentUser && Number(currentUser.id) === Number(u.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理系统用户账号和权限</p>
        </div>
        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-lg">
          共 {total} 位用户
        </span>
      </div>

      <div className="card !p-0">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
            <span className="ml-2 text-gray-500">加载中...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">ID</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">用户名</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">昵称</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">邮箱</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">手机号</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">角色</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">状态</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">注册时间</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-sm text-gray-500">{u.id}</td>
                      <td className="px-5 py-3 text-sm font-medium text-gray-900">
                        {u.username}
                        {isSelf(u) && <span className="ml-1 text-xs text-primary-600">(我)</span>}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">{u.nickname || '-'}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{u.email || '-'}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{u.phone || '-'}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          u.role === 'admin'
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {u.role === 'admin' ? '管理员' : '普通用户'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          Number(u.status) === 1
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {Number(u.status) === 1 ? '正常' : '禁用'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('zh-CN') : '-'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                            title="编辑"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {!isSelf(u) && (
                            <button
                              onClick={() => setDeleteConfirm({ open: true, user: u })}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-5 py-12 text-center text-gray-400">
                        暂无用户数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  第 {page} / {totalPages} 页
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="btn-secondary py-1.5 px-3"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className="btn-secondary py-1.5 px-3"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditModal({ open: false, user: null })} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">编辑用户</h3>
              <button
                onClick={() => setEditModal({ open: false, user: null })}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label-text">昵称</label>
                <input
                  type="text"
                  className="input-field"
                  value={editForm.nickname}
                  onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                />
              </div>
              <div>
                <label className="label-text">邮箱</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="选填"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="label-text">手机号</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="选填"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="label-text">角色</label>
                <select
                  className="select-field"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  disabled={isSelf(editModal.user)}
                >
                  <option value="user">普通用户</option>
                  <option value="admin">管理员</option>
                </select>
                {isSelf(editModal.user) && (
                  <p className="text-xs text-amber-600 mt-1">管理员不能修改自己的角色</p>
                )}
              </div>
              <div>
                <label className="label-text">状态</label>
                <select
                  className="select-field"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: Number(e.target.value) })}
                  disabled={isSelf(editModal.user)}
                >
                  <option value={1}>正常</option>
                  <option value={0}>禁用</option>
                </select>
                {isSelf(editModal.user) && (
                  <p className="text-xs text-amber-600 mt-1">管理员不能禁用自己的账号</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setEditModal({ open: false, user: null })} className="btn-secondary">
                取消
              </button>
              <button onClick={handleUpdate} disabled={editLoading} className="btn-primary">
                {editLoading ? (
                  <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />保存中...</>
                ) : (
                  <><Save className="w-4 h-4 mr-1.5" />保存</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmModal
        open={deleteConfirm.open}
        title="确认删除"
        message={`确定要删除用户「${deleteConfirm.user?.username}」吗？此操作不可恢复。`}
        confirmText="删除"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ open: false, user: null })}
      />
    </div>
  )
}
