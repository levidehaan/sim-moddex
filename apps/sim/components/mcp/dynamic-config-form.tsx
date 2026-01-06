'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import type { McpConfigSchema, McpConfigProperty } from '@/lib/mcp/types'

interface DynamicConfigFormProps {
  schema: McpConfigSchema
  values: Record<string, any>
  onChange: (values: Record<string, any>) => void
  errors?: Record<string, string>
}

export function DynamicConfigForm({ schema, values, onChange, errors = {} }: DynamicConfigFormProps) {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  const handleFieldChange = (fieldName: string, value: any) => {
    onChange({
      ...values,
      [fieldName]: value,
    })
  }

  const handleArrayAdd = (fieldName: string) => {
    const currentArray = values[fieldName] || []
    handleFieldChange(fieldName, [...currentArray, ''])
  }

  const handleArrayRemove = (fieldName: string, index: number) => {
    const currentArray = values[fieldName] || []
    handleFieldChange(
      fieldName,
      currentArray.filter((_: any, i: number) => i !== index)
    )
  }

  const handleArrayItemChange = (fieldName: string, index: number, value: any) => {
    const currentArray = [...(values[fieldName] || [])]
    currentArray[index] = value
    handleFieldChange(fieldName, currentArray)
  }

  const toggleSecretVisibility = (fieldName: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }))
  }

  const renderField = (fieldName: string, property: McpConfigProperty) => {
    const value = values[fieldName] ?? property.default
    const error = errors[fieldName]
    const isRequired = schema.required?.includes(fieldName)
    const isSecret = property.secret === true
    const showSecret = showSecrets[fieldName]

    switch (property.type) {
      case 'string':
        if (property.enum) {
          return (
            <div key={fieldName} className="space-y-2">
              <Label htmlFor={fieldName}>
                {property.title || fieldName}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {property.description && (
                <p className="text-sm text-muted-foreground">{property.description}</p>
              )}
              <Select value={value || ''} onValueChange={(v) => handleFieldChange(fieldName, v)}>
                <SelectTrigger id={fieldName}>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {property.enum.map((option) => (
                    <SelectItem key={String(option)} value={String(option)}>
                      {String(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          )
        }

        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>
              {property.title || fieldName}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {property.description && (
              <p className="text-sm text-muted-foreground">{property.description}</p>
            )}
            <div className="relative">
              <Input
                id={fieldName}
                type={isSecret && !showSecret ? 'password' : 'text'}
                value={value || ''}
                onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                placeholder={property.description}
                className={error ? 'border-red-500' : ''}
              />
              {isSecret && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => toggleSecretVisibility(fieldName)}
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              )}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'number':
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>
              {property.title || fieldName}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {property.description && (
              <p className="text-sm text-muted-foreground">{property.description}</p>
            )}
            <Input
              id={fieldName}
              type="number"
              value={value ?? ''}
              onChange={(e) => handleFieldChange(fieldName, Number(e.target.value))}
              placeholder={property.description}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'boolean':
        return (
          <div key={fieldName} className="flex items-center justify-between space-x-2 py-2">
            <div className="space-y-0.5">
              <Label htmlFor={fieldName}>{property.title || fieldName}</Label>
              {property.description && (
                <p className="text-sm text-muted-foreground">{property.description}</p>
              )}
            </div>
            <Switch
              id={fieldName}
              checked={value ?? property.default ?? false}
              onCheckedChange={(checked) => handleFieldChange(fieldName, checked)}
            />
          </div>
        )

      case 'array':
        const arrayValue = value || []
        return (
          <div key={fieldName} className="space-y-2">
            <Label>
              {property.title || fieldName}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {property.description && (
              <p className="text-sm text-muted-foreground">{property.description}</p>
            )}
            <div className="space-y-2">
              {arrayValue.map((item: any, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => handleArrayItemChange(fieldName, index, e.target.value)}
                    placeholder={`Item ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleArrayRemove(fieldName, index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleArrayAdd(fieldName)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'object':
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>
              {property.title || fieldName}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {property.description && (
              <p className="text-sm text-muted-foreground">{property.description}</p>
            )}
            <Textarea
              id={fieldName}
              value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value || ''}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  handleFieldChange(fieldName, parsed)
                } catch {
                  handleFieldChange(fieldName, e.target.value)
                }
              }}
              placeholder="JSON object"
              className={error ? 'border-red-500' : ''}
              rows={4}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {Object.entries(schema.properties).map(([fieldName, property]) =>
        renderField(fieldName, property)
      )}
    </div>
  )
}
