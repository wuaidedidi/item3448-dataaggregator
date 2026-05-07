import React, { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, Copy, ChevronDown, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ResultTable({ data }) {
  const [sortField, setSortField] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [expandedRows, setExpandedRows] = useState(new Set())

  const sortedData = useMemo(() => {
    if (!data || !sortField) return data || []
    return [...data].sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      }
      aVal = String(aVal || '')
      bVal = String(bVal || '')
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    })
  }, [data, sortField, sortDir])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(String(text)).then(() => {
      toast.success('已复制到剪贴板')
    }).catch(() => {
      const textArea = document.createElement('textarea')
      textArea.value = String(text)
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('已复制到剪贴板')
    })
  }

  const toggleExpand = (index) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedRows(newExpanded)
  }

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '-'
    return Number(num).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-300" />
    return sortDir === 'asc'
      ? <ArrowUp className="w-3.5 h-3.5 text-primary-600" />
      : <ArrowDown className="w-3.5 h-3.5 text-primary-600" />
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        暂无汇总结果
      </div>
    )
  }

  const columns = [
    { key: 'name', label: '汇总项名称', sortable: true },
    { key: 'tables', label: '关联数据表', sortable: true },
    { key: 'summaryColumn', label: '汇总指标', sortable: true },
    { key: 'value', label: '汇总值(万元)', sortable: true, isNumber: true },
    { key: 'conditionCount', label: '条件数', sortable: true, isNumber: true },
  ]

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="w-10 px-3 py-3" />
              <th className="w-14 px-3 py-3 text-left text-xs font-semibold text-gray-600">序号</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs font-semibold text-gray-600 ${
                    col.isNumber ? 'text-right' : 'text-left'
                  } ${col.sortable ? 'cursor-pointer select-none hover:bg-gray-100' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className={`flex items-center space-x-1 ${col.isNumber ? 'justify-end' : ''}`}>
                    <span>{col.label}</span>
                    {col.sortable && <SortIcon field={col.key} />}
                  </div>
                </th>
              ))}
              <th className="w-16 px-3 py-3 text-center text-xs font-semibold text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedData.map((row, index) => (
              <React.Fragment key={index}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 text-center">
                    {row.details && row.details.length > 0 && (
                      <button
                        onClick={() => toggleExpand(index)}
                        className="p-0.5 rounded text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {expandedRows.has(index)
                          ? <ChevronDown className="w-4 h-4" />
                          : <ChevronRight className="w-4 h-4" />}
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{row.tables}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{row.summaryColumn}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-right text-emerald-700">
                    {formatNumber(row.value)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-500">{row.conditionCount}</td>
                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={() => handleCopy(row.value)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                      title="复制汇总值"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
                {/* Expanded details */}
                {expandedRows.has(index) && row.details && (
                  <tr className="bg-blue-50/30">
                    <td colSpan={8} className="px-6 py-3">
                      <div className="text-xs text-gray-500 mb-2 font-medium">分表明细</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {row.details.map((d, di) => (
                          <div
                            key={di}
                            className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100"
                          >
                            <div>
                              <span className="text-sm text-gray-700">{d.table}</span>
                              <span className="text-xs text-gray-400 ml-2">({d.rowCount}行)</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {formatNumber(d.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
          {/* Summary footer */}
          <tfoot>
            <tr className="bg-gray-50 border-t-2 border-gray-200">
              <td colSpan={5} className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">
                合计
              </td>
              <td className="px-4 py-3 text-sm font-bold text-right text-emerald-700">
                {formatNumber(sortedData.reduce((sum, r) => sum + (r.value || 0), 0))}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
