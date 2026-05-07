import request from './request'

export const loginApi = (data) => request.post('/auth/login', data)

export const registerApi = (data) => request.post('/auth/register', data)

export const getProfileApi = () => request.get('/auth/profile')

export const updateProfileApi = (data) => request.put('/auth/profile', data)

export const changePasswordApi = (data) => request.put('/auth/password', data)
