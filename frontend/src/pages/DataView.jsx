import { useState, useEffect } from 'react'
import { getTablesApi, getTableDataApi } from '../api/tables'
import { Database, Loader2, ChevronLeft, ChevronRight, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DataView() {
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState('')
  const [tableData, setTableData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadTables()
  }, [])

  useEffect(() => {
    if (selectedTable) {
      loadTableData()
    }
  }, [selectedTable, page])

  const loadTables = async () => {
    setLoading(true)
    try {
      const res = await getTablesApi()
      setTables(res.data || [])
      if (res.data?.length > 0) {
        setSelectedTable(res.data[0].table_name)
      }
    } catch { /* interceptor */ }
    finally { setLoading(false) }
  }

  const loadTableData = async () => {
    setDataLoading(true)
    try {
      const res = await getTableDataApi(selectedTable, { page, pageSize: 15 })
      setTableData(res.data)
    } catch { /* interceptor */ }
    finally { setDataLoading(false) }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(String(text)).then(() => {
      toast.success('已复制到剪贴板')
    }).catch(() => {
      const ta = document.createElement('textarea')
      ta.value = String(text)
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      toast.success('已复制到剪贴板')
    })
  }

  const formatCellValue = (value, dataType) => {
    if (value === null || value === undefined || value === '') return '-'
    if (dataType === 'number') {
      return Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
    return String(value)
  }

  const getTableDisplayName = (tableName) => {
    const t = tables.find((t) => t.table_name === tableName)
    return t?.display_name || tableName
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        <span className="ml-3 text-gray-500">加载中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">数据浏览</h1>
        <p className="text-sm text-gray-500 mt-1">查看各数据表中的原始数据</p>
      </div>

      {/* Table selector tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-1">
        {tables.map((t) => (
          <button
            key={t.table_name}
            onClick={() => { setSelectedTable(t.table_name); setPage(1) }}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              selectedTable === t.table_name
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
            }`}
          >
            <Database className="w-4 h-4 mr-2" />
            {t.display_name}
          </button>
        ))}
      </div>

      {/* Data table */}
      <div className="card !p-0">
        {dataLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
            <span className="ml-2 text-gray-500">加载中...</span>
          </div>
        ) : tableData ? (
          <>
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {getTableDisplayName(selectedTable)}
              </span>
              <span className="text-xs text-gray-400">共 {tableData.total} 条数据</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    {tableData.columns?.map((col) => (
                      <th
                        key={col.column_name}
                        className={`px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap ${
                          col.data_type === 'number' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {col.display_name}
                      </th>
                    ))}
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 w-12">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tableData.items?.map((row, ri) => (
                    <tr key={ri} className="hover:bg-gray-50 transition-colors">
                      {tableData.columns?.map((col) => (
                        <td
                          key={col.column_name}
                          className={`px-4 py-2.5 text-sm whitespace-nowrap ${
                            col.data_type === 'number'
                              ? 'text-right font-medium text-gray-800'
                              : 'text-gray-600'
                          }`}
                        >
                          {formatCellValue(row[col.column_name], col.data_type)}
                        </td>
                      ))}
                      <td className="px-3 py-2.5 text-center">
                        <button
                          onClick={() => handleCopy(JSON.stringify(row))}
                          className="p-1 text-gray-300 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          title="复制行数据"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!tableData.items || tableData.items.length === 0) && (
                    <tr>
                      <td
                        colSpan={(tableData.columns?.length || 0) + 1}
                        className="px-4 py-12 text-center text-gray-400"
                      >
                        暂无数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {tableData.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  第 {page} / {tableData.totalPages} 页
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
                    onClick={() => setPage(Math.min(tableData.totalPages, page + 1))}
                    disabled={page >= tableData.totalPages}
                    className="btn-secondary py-1.5 px-3"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center py-20 text-gray-400">
            请选择一个数据表
          </div>
        )}
      </div>
    </div>
  )
}
