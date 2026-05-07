import request from './request'

export const getTablesApi = () => request.get('/tables')

export const getColumnsApi = (tableName) => request.get(`/tables/${tableName}/columns`)

export const getTableDataApi = (tableName, params) => request.get(`/tables/${tableName}/data`, { params })
