import { useState, useEffect } from 'react'
import { X, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'

const OPERATORS = [
  { value: 'equals', label: '等于' },
  { value: 'not_equals', label: '不等于' },
  { value: 'greater_than', label: '大于' },
  { value: 'less_than', label: '小于' },
  { value: 'greater_equal', label: '大于等于' },
  { value: 'less_equal', label: '小于等于' },
  { value: 'contains', label: '包含' },
  { value: 'not_contains', label: '不包含' },
]

const LOGIC_OPTIONS = [
  { value: 'AND', label: '且' },
  { value: 'OR', label: '或' },
]

const emptyCondition = () => ({
  column: '',
  operator: 'equals',
  value: '',
  logic: 'AND',
})

export default function SummaryItemModal({ open, tables, allColumns, editingItem, onSave, onClose }) {
  const [name, setName] = useState('')
  const [selectedTables, setSelectedTables] = useState({})
  const [summaryColumn, setSummaryColumn] = useState('')
  const [enableCondition, setEnableCondition] = useState(false)
  const [conditions, setConditions] = useState([])

  useEffect(() => {
    if (open) {
      if (editingItem) {
        setName(editingItem.name || '')
        const tMap = {}
        tables.forEach((t) => {
          tMap[t.table_name] = editingItem.tables?.includes(t.table_name) || false
        })
        setSelectedTables(tMap)
        setSummaryColumn(editingItem.summaryColumn || '')
        setEnableCondition(editingItem.conditions?.length > 0)
        setConditions(editingItem.conditions?.length > 0 ? [...editingItem.conditions] : [])
      } else {
        setName('')
        const tMap = {}
        tables.forEach((t) => { tMap[t.table_name] = false })
        setSelectedTables(tMap)
        setSummaryColumn('')
        setEnableCondition(false)
        setConditions([])
      }
    }
  }, [open, editingItem, tables])

  const activeTables = Object.entries(selectedTables)
    .filter(([, v]) => v)
    .map(([k]) => k)

  const availableColumns = () => {
    if (activeTables.length === 0) return []
    const firstTableCols = allColumns[activeTables[0]] || []
    return firstTableCols.filter((c) => c.is_summable === 1 || c.is_summable === '1')
  }

  const allAvailableColumns = () => {
    if (activeTables.length === 0) return []
    const firstTableCols = allColumns[activeTables[0]] || []
    return firstTableCols
  }

  useEffect(() => {
    const cols = availableColumns()
    if (summaryColumn && cols.length > 0) {
      const valid = cols.some((c) => c.column_name === summaryColumn)
      if (!valid) setSummaryColumn('')
    }
    if (activeTables.length === 0 && summaryColumn) {
      setSummaryColumn('')
    }
    if (enableCondition && conditions.length > 0) {
      const allCols = allAvailableColumns()
      const colNames = new Set(allCols.map((c) => c.column_name))
      const updated = conditions.map((cond) => {
        if (cond.column && !colNames.has(cond.column)) {
          return { ...cond, column: '' }
        }
        return cond
      })
      const hasChanged = updated.some((c, i) => c.column !== conditions[i].column)
      if (hasChanged) setConditions(updated)
    }
  }, [selectedTables])

  const toggleTable = (tableName) => {
    setSelectedTables((prev) => ({
      ...prev,
      [tableName]: !prev[tableName],
    }))
  }

  const addCondition = () => {
    setConditions([...conditions, emptyCondition()])
  }

  const removeCondition = (index) => {
    setConditions(conditions.filter((_, i) => i !== index))
  }

  const updateCondition = (index, field, value) => {
    const updated = [...conditions]
    updated[index] = { ...updated[index], [field]: value }
    setConditions(updated)
  }

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('请输入汇总项名称')
      return
    }
    if (activeTables.length === 0) {
      toast.error('请至少选择一个数据表')
      return
    }
    if (!summaryColumn) {
      toast.error('请选择汇总列')
      return
    }

    if (enableCondition && conditions.length > 0) {
      for (let i = 0; i < conditions.length; i++) {
        const c = conditions[i]
        if (!c.column) {
          toast.error(`第${i + 1}个条件未选择列名`)
          return
        }
        if (!c.value && c.value !== 0) {
          toast.error(`第${i + 1}个条件未填写值`)
          return
        }
      }
    }

    onSave({
      name: name.trim(),
      tables: activeTables,
      summaryColumn,
      conditions: enableCondition ? conditions : [],
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingItem ? '编辑汇总项' : '添加汇总项'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Name input */}
          <div>
            <label className="label-text">
              汇总项名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="如：A+B 计划总投资"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Table selection */}
          <div>
            <label className="label-text">
              选择数据表 <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">选择参与汇总计算的数据表，可多选</p>
            <div className="space-y-2">
              {tables.map((table) => (
                <div
                  key={table.table_name}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedTables[table.table_name]
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  onClick={() => toggleTable(table.table_name)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${selectedTables[table.table_name] ? 'bg-primary-600' : 'bg-gray-300'}`} />
                    <div>
                      <span className="text-sm font-medium text-gray-800">{table.display_name}</span>
                      {table.description && (
                        <p className="text-xs text-gray-400 mt-0.5">{table.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleTable(table.table_name) }}
                    className="flex-shrink-0"
                  >
                    {selectedTables[table.table_name] ? (
                      <ToggleRight className="w-8 h-8 text-primary-600" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-gray-300" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Summary column selection */}
          <div>
            <label className="label-text">
              汇总列 <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-2">选择需要进行求和汇总的数值指标列</p>
            <select
              className="select-field"
              value={summaryColumn}
              onChange={(e) => setSummaryColumn(e.target.value)}
            >
              <option value="">请选择汇总列</option>
              {availableColumns().map((col) => (
                <option key={col.column_name} value={col.column_name}>
                  {col.display_name}
                </option>
              ))}
            </select>
            {activeTables.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">请先选择数据表</p>
            )}
          </div>

          {/* Condition toggle */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <label className="label-text mb-0">条件配置</label>
                <p className="text-xs text-gray-400 mt-0.5">可选：为汇总添加筛选条件</p>
              </div>
              <button
                onClick={() => {
                  setEnableCondition(!enableCondition)
                  if (!enableCondition && conditions.length === 0) {
                    setConditions([emptyCondition()])
                  }
                }}
                className="flex-shrink-0"
              >
                {enableCondition ? (
                  <ToggleRight className="w-10 h-10 text-primary-600" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {/* Conditions builder */}
          {enableCondition && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">筛选条件</span>
                <button
                  onClick={addCondition}
                  className="text-xs text-primary-600 hover:text-primary-700 flex items-center"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  添加条件
                </button>
              </div>

              <div className="space-y-3">
                {conditions.map((cond, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                    {index > 0 && (
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs text-gray-500">逻辑关系：</span>
                        <div className="flex rounded-md overflow-hidden border border-gray-200">
                          {LOGIC_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => updateCondition(index, 'logic', opt.value)}
                              className={`px-3 py-1 text-xs font-medium transition-colors ${
                                cond.logic === opt.value
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-white text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-4">
                        <label className="text-xs text-gray-500 block mb-1">列名</label>
                        <select
                          className="select-field text-xs py-1.5"
                          value={cond.column}
                          onChange={(e) => updateCondition(index, 'column', e.target.value)}
                        >
                          <option value="">选择列</option>
                          {allAvailableColumns().map((col) => (
                            <option key={col.column_name} value={col.column_name}>
                              {col.display_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <label className="text-xs text-gray-500 block mb-1">规则</label>
                        <select
                          className="select-field text-xs py-1.5"
                          value={cond.operator}
                          onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                        >
                          {OPERATORS.map((op) => (
                            <option key={op.value} value={op.value}>
                              {op.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-4">
                        <label className="text-xs text-gray-500 block mb-1">值</label>
                        <input
                          type="text"
                          className="input-field text-xs py-1.5"
                          placeholder="输入条件值"
                          value={cond.value}
                          onChange={(e) => updateCondition(index, 'value', e.target.value)}
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => removeCondition(index)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {conditions.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-400">暂无条件，点击"添加条件"按钮</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
          <button onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button onClick={handleSave} className="btn-primary">
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
