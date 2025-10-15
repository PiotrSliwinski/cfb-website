'use client'

import { useState } from 'react'
import { Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react'

interface JsonEditorProps {
  value: any
  onChange: (value: any) => void
  label?: string
  description?: string
}

export function JsonEditor({ value, onChange, label, description }: JsonEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual')
  const [codeValue, setCodeValue] = useState(JSON.stringify(value, null, 2))
  const [codeError, setCodeError] = useState<string | null>(null)

  const handleCodeChange = (newCode: string) => {
    setCodeValue(newCode)
    try {
      const parsed = JSON.parse(newCode)
      setCodeError(null)
      onChange(parsed)
    } catch (e) {
      setCodeError(e instanceof Error ? e.message : 'Invalid JSON')
    }
  }

  const handleVisualChange = (newValue: any) => {
    onChange(newValue)
    setCodeValue(JSON.stringify(newValue, null, 2))
  }

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            <div>
              {label && <label className="block text-sm font-medium text-gray-900">{label}</label>}
              {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setViewMode('visual')}
              className={`px-3 py-1 text-xs rounded ${
                viewMode === 'visual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Visual
            </button>
            <button
              type="button"
              onClick={() => setViewMode('code')}
              className={`px-3 py-1 text-xs rounded ${
                viewMode === 'code'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Code
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          {viewMode === 'visual' ? (
            <VisualJsonEditor value={value} onChange={handleVisualChange} />
          ) : (
            <div>
              <textarea
                value={codeValue}
                onChange={(e) => handleCodeChange(e.target.value)}
                className={`w-full h-64 font-mono text-sm p-3 border rounded ${
                  codeError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                spellCheck={false}
              />
              {codeError && (
                <p className="mt-2 text-sm text-red-600">Error: {codeError}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function VisualJsonEditor({ value, onChange }: { value: any; onChange: (value: any) => void }) {
  if (Array.isArray(value)) {
    return <ArrayEditor value={value} onChange={onChange} />
  }

  if (typeof value === 'object' && value !== null) {
    return <ObjectEditor value={value} onChange={onChange} />
  }

  return <PrimitiveEditor value={value} onChange={onChange} />
}

function ArrayEditor({ value, onChange }: { value: any[]; onChange: (value: any[]) => void }) {
  const addItem = () => {
    // Determine what type of item to add based on existing items
    if (value.length > 0) {
      const firstItem = value[0]
      if (typeof firstItem === 'object' && !Array.isArray(firstItem)) {
        // Clone the structure of the first object
        const newItem = Object.keys(firstItem).reduce((acc, key) => {
          acc[key] = ''
          return acc
        }, {} as any)
        onChange([...value, newItem])
      } else {
        onChange([...value, ''])
      }
    } else {
      onChange([...value, ''])
    }
  }

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, newValue: any) => {
    const newArray = [...value]
    newArray[index] = newValue
    onChange(newArray)
  }

  return (
    <div className="space-y-3">
      {value.map((item, index) => (
        <div key={index} className="flex gap-2 items-start">
          <div className="flex-1 border border-gray-200 rounded p-3 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">Item {index + 1}</span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <VisualJsonEditor value={item} onChange={(v) => updateItem(index, v)} />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 rounded hover:bg-blue-50"
      >
        <Plus className="w-4 h-4" />
        Add Item
      </button>
    </div>
  )
}

function ObjectEditor({ value, onChange }: { value: Record<string, any>; onChange: (value: Record<string, any>) => void }) {
  const updateField = (key: string, newValue: any) => {
    onChange({ ...value, [key]: newValue })
  }

  const addField = () => {
    const newKey = `field_${Object.keys(value).length + 1}`
    onChange({ ...value, [newKey]: '' })
  }

  const removeField = (key: string) => {
    const newValue = { ...value }
    delete newValue[key]
    onChange(newValue)
  }

  const renameField = (oldKey: string, newKey: string) => {
    if (oldKey === newKey) return
    const newValue = { ...value }
    newValue[newKey] = newValue[oldKey]
    delete newValue[oldKey]
    onChange(newValue)
  }

  return (
    <div className="space-y-3">
      {Object.entries(value).map(([key, val]) => (
        <div key={key} className="border border-gray-200 rounded p-3 bg-gray-50">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={key}
              onChange={(e) => renameField(key, e.target.value)}
              className="flex-1 px-2 py-1 text-sm font-medium border border-gray-300 rounded"
              placeholder="Field name"
            />
            <button
              type="button"
              onClick={() => removeField(key)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <VisualJsonEditor value={val} onChange={(v) => updateField(key, v)} />
        </div>
      ))}
      <button
        type="button"
        onClick={addField}
        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 rounded hover:bg-blue-50"
      >
        <Plus className="w-4 h-4" />
        Add Field
      </button>
    </div>
  )
}

function PrimitiveEditor({ value, onChange }: { value: any; onChange: (value: any) => void }) {
  const [type, setType] = useState<'string' | 'number' | 'boolean'>(() => {
    if (typeof value === 'number') return 'number'
    if (typeof value === 'boolean') return 'boolean'
    return 'string'
  })

  const handleChange = (newValue: string) => {
    if (type === 'number') {
      onChange(Number(newValue))
    } else if (type === 'boolean') {
      onChange(newValue === 'true')
    } else {
      onChange(newValue)
    }
  }

  const handleTypeChange = (newType: 'string' | 'number' | 'boolean') => {
    setType(newType)
    if (newType === 'number') {
      onChange(0)
    } else if (newType === 'boolean') {
      onChange(false)
    } else {
      onChange('')
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <select
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as any)}
          className="px-2 py-1 text-xs border border-gray-300 rounded"
        >
          <option value="string">Text</option>
          <option value="number">Number</option>
          <option value="boolean">True/False</option>
        </select>
      </div>
      {type === 'boolean' ? (
        <select
          value={value ? 'true' : 'false'}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded"
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      ) : type === 'number' ? (
        <input
          type="number"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
      ) : (
        <textarea
          value={value ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded"
          rows={3}
        />
      )}
    </div>
  )
}
