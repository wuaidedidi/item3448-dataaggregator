import request from './request'

export const generateSummaryApi = (data) => request.post('/summary/generate', data)
