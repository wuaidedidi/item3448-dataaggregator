import request from './request'

export const getUsersApi = (params) => request.get('/users', { params })

export const updateUserApi = (id, data) => request.put(`/users/${id}`, data)

export const deleteUserApi = (id) => request.delete(`/users/${id}`)
