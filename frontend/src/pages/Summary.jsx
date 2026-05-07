import { useState, useEffect, useCallback } from 'react'
import { getTablesApi, getColumnsApi } from '../api/tables'
import { generateSummaryApi } from '../api/summary'
import SummaryItemModal from '../components/SummaryItemModal'
import ResultTable from '../components/ResultTable'
import ConfirmModal from '../components/ConfirmModal'
import toast from 'react-hot-toast'
import {
  Plus,
  Trash2,
  Play,
  FileSpreadsheet,
  Settings2,
  CheckSquare,
  Loader2,
  ListChecks,
  Info,
} from 'lucide-react'
import * as XLSX from 'xlsx'

export default function Summary() {
  const [tables, setTables] = useState([])
  const [allColumns, setAllColumns] = useState({})
  const [summaryItems, setSummaryItems] = useState([])
  const [results, setResults] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [confirmDelete, setConfirmDelete] = useState({ open: false, type: '', ids: [] })

  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    setLoading(true)
    try {
      const res = await getTablesApi()
      setTables(res.data || [])
      const columnsMap = {}
      for (const table of res.data || []) {
        try {
          const colRes = await getColumnsApi(table.table_name)
          columnsMap[table.table_name] = colRes.data || []
        } catch { /* skip */ }
      }
      setAllColumns(columnsMap)
    } catch { /* interceptor handles */ }
    finally { setLoading(false) }
  }

  const handleAddItem = () => {
    if (summaryItems.length >= 50) {
      toast.error('汇总项数量不能超过50个')
      return
    }
    setEditingItem(null)
    setModalOpen(true)
  }

  const handleEditItem = (item, index) => {
    setEditingItem({ ...item, _index: index })
    setModalOpen(true)
  }

  const handleSaveItem = (item) => {
    if (editingItem !== null && editingItem._index !== undefined) {
      const updated = [...summaryItems]
      updated[editingItem._index] = item
      setSummaryItems(updated)
      toast.success('汇总项已更新')
    } else {
      setSummaryItems([...summaryItems, item])
      toast.success('汇总项已添加')
    }
    setModalOpen(false)
    setEditingItem(null)
  }

  const handleDeleteSingle = (index) => {
    setConfirmDelete({
      open: true,
      type: 'single',
      ids: [index],
    })
  }

  const handleDeleteSelected = () => {
    if (selectedItems.size === 0) {
      toast.error('请先选择要删除的汇总项')
      return
    }
    setConfirmDelete({
      open: true,
      type: 'batch',
      ids: Array.from(selectedItems),
    })
  }

  const confirmDeleteItems = () => {
    const idsToDelete = new Set(confirmDelete.ids)
    setSummaryItems(summaryItems.filter((_, i) => !idsToDelete.has(i)))
    setSelectedItems(new Set())
    setConfirmDelete({ open: false, type: '', ids: [] })
    toast.success('删除成功')
  }

  const toggleSelectItem = (index) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedItems(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedItems.size === summaryItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(summaryItems.map((_, i) => i)))
    }
  }

  const handleGenerate = async () => {
    if (summaryItems.length === 0) {
      toast.error('请先添加汇总项')
      return
    }

    setGenerating(true)
    try {
      const payload = {
        items: summaryItems.map((item) => ({
          name: item.name,
          tables: item.tables,
          summaryColumn: item.summaryColumn,
          conditions: item.conditions || [],
        })),
      }
      const res = await generateSummaryApi(payload)
      setResults(res.data)
      toast.success('汇总表生成成功')
    } catch { /* interceptor handles */ }
    finally { setGenerating(false) }
  }

  const handleExportExcel = useCallback(() => {
    if (!results || !results.results?.length) {
      toast.error('暂无数据可导出')
      return
    }

    const exportData = results.results.map((r, i) => ({
      '序号': i + 1,
      '汇总项名称': r.name,
      '关联数据表': r.tables,
      '汇总指标': r.summaryColumn,
      '汇总值(万元)': r.value,
      '条件数': r.conditionCount,
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const colWidths = [
      { wch: 6 }, { wch: 30 }, { wch: 25 }, { wch: 20 }, { wch: 18 }, { wch: 8 },
    ]
    ws['!cols'] = colWidths

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '汇总结果')
    XLSX.writeFile(wb, `汇总报表_${new Date().toISOString().slice(0, 10)}.xlsx`)
    toast.success('Excel导出成功')
  }, [results])

  const getTableDisplayName = (tableName) => {
    const t = tables.find((t) => t.table_name === tableName)
    return t?.display_name || tableName
  }

  const getColumnDisplayName = (columnName, tableName) => {
    const cols = allColumns[tableName] || allColumns[Object.keys(allColumns)[0]] || []
    const col = cols.find((c) => c.column_name === columnName)
    return col?.display_name || columnName
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
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">综合汇总</h1>
          <p className="text-sm text-gray-500 mt-1">配置汇总项，一键生成跨表汇总报表</p>
        </div>
      </div>

      {/* Step guide */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-5 border border-primary-100">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-primary-800 mb-2">操作引导 - 三步完成汇总</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">添加汇总项</p>
                  <p className="text-xs text-gray-500">选择数据表、汇总列，配置筛选条件</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">管理汇总项</p>
                  <p className="text-xs text-gray-500">编辑、删除或批量管理已添加的汇总项</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">生成并导出</p>
                  <p className="text-xs text-gray-500">一键生成汇总表，支持Excel导出</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary items management */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ListChecks className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">汇总项管理</h2>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              {summaryItems.length} 项
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {summaryItems.length > 0 && (
              <button onClick={handleDeleteSelected} className="btn-secondary text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-1.5" />
                批量删除 {selectedItems.size > 0 && `(${selectedItems.size})`}
              </button>
            )}
            <button onClick={handleAddItem} className="btn-primary">
              <Plus className="w-4 h-4 mr-1.5" />
              添加汇总项
            </button>
          </div>
        </div>

        {summaryItems.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
            <Settings2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-1">暂未添加汇总项</p>
            <p className="text-sm text-gray-400 mb-4">点击"添加汇总项"按钮开始配置</p>
            <button onClick={handleAddItem} className="btn-primary">
              <Plus className="w-4 h-4 mr-1.5" />
              添加汇总项
            </button>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="w-12 px-4 py-3 text-center">
                    <button
                      onClick={toggleSelectAll}
                      className={`w-4 h-4 rounded border transition-colors ${
                        selectedItems.size === summaryItems.length && summaryItems.length > 0
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'border-gray-300 hover:border-primary-400'
                      } flex items-center justify-center`}
                    >
                      {selectedItems.size === summaryItems.length && summaryItems.length > 0 && (
                        <CheckSquare className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">序号</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">汇总项名称</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">关联表</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">汇总列</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">条件</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {summaryItems.map((item, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedItems.has(index) ? 'bg-primary-50/50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleSelectItem(index)}
                        className={`w-4 h-4 rounded border transition-colors ${
                          selectedItems.has(index)
                            ? 'bg-primary-600 border-primary-600 text-white'
                            : 'border-gray-300 hover:border-primary-400'
                        } flex items-center justify-center`}
                      >
                        {selectedItems.has(index) && <CheckSquare className="w-3 h-3" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex flex-wrap gap-1">
                        {item.tables.map((t) => (
                          <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                            {getTableDisplayName(t)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {getColumnDisplayName(item.summaryColumn, item.tables[0])}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.conditions?.length > 0 ? (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded">
                          {item.conditions.length} 个条件
                        </span>
                      ) : (
                        <span className="text-gray-400">无</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleEditItem(item, index)}
                          className="px-2 py-1 text-xs text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDeleteSingle(index)}
                          className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Generate button */}
        {summaryItems.length > 0 && (
          <div className="mt-6 flex items-center justify-center">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn-success px-8 py-3 text-base"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  正在生成...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  生成汇总表
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Results section */}
      {results && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-800">汇总结果</h2>
              <span className="text-xs text-gray-400">
                生成时间：{results.generatedAt}
              </span>
            </div>
            <button onClick={handleExportExcel} className="btn-secondary">
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
              导出Excel
            </button>
          </div>
          <ResultTable data={results.results} />
        </div>
      )}

      {/* Add/Edit Modal */}
      <SummaryItemModal
        open={modalOpen}
        tables={tables}
        allColumns={allColumns}
        editingItem={editingItem}
        onSave={handleSaveItem}
        onClose={() => {
          setModalOpen(false)
          setEditingItem(null)
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        open={confirmDelete.open}
        title="确认删除"
        message={
          confirmDelete.type === 'single'
            ? '确定要删除该汇总项吗？'
            : `确定要删除选中的 ${confirmDelete.ids.length} 个汇总项吗？`
        }
        confirmText="删除"
        danger
        onConfirm={confirmDeleteItems}
        onCancel={() => setConfirmDelete({ open: false, type: '', ids: [] })}
      />
    </div>
  )
}
