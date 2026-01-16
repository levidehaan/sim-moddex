import type { Aggregation, FieldExtraction, Transformation } from '@/tools/kafka/types'

/**
 * Extract a value from an object using a JSONPath-like string
 * Supports simple dot notation like "value.user.id"
 */
export function extractValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined

  const parts = path.split('.')
  let current: any = obj

  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    current = current[part]
  }

  return current
}

/**
 * Extract specified fields from a message
 */
export function extractFields(
  message: unknown,
  extractions: FieldExtraction[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const extraction of extractions) {
    const value = extractValue(message, extraction.path)
    result[extraction.name] = value
  }

  return result
}

/**
 * Apply a transformation to a value
 */
export function applyTransformation(value: unknown, transformation: Transformation): unknown {
  const { operation } = transformation

  // Mathematical operations
  if (['add', 'subtract', 'multiply', 'divide'].includes(operation)) {
    const numValue = typeof value === 'number' ? value : Number(value)
    const operand = typeof transformation.value === 'number' ? transformation.value : Number(transformation.value)

    if (isNaN(numValue) || isNaN(operand)) return value

    switch (operation) {
      case 'add':
        return numValue + operand
      case 'subtract':
        return numValue - operand
      case 'multiply':
        return numValue * operand
      case 'divide':
        return operand !== 0 ? numValue / operand : value
    }
  }

  // Text operations
  if (['uppercase', 'lowercase', 'trim', 'substring'].includes(operation)) {
    const strValue = String(value)

    switch (operation) {
      case 'uppercase':
        return strValue.toUpperCase()
      case 'lowercase':
        return strValue.toLowerCase()
      case 'trim':
        return strValue.trim()
      case 'substring':
        return strValue.substring(transformation.start ?? 0, transformation.end)
    }
  }

  return value
}

/**
 * Apply transformations to extracted data
 */
export function applyTransformations(
  data: Record<string, unknown>,
  transformations: Transformation[]
): Record<string, unknown> {
  const result = { ...data }

  for (const transformation of transformations) {
    if (result[transformation.field] !== undefined) {
      result[transformation.field] = applyTransformation(result[transformation.field], transformation)
    }
  }

  return result
}

/**
 * Compute aggregations across multiple data records
 */
export function computeAggregations(
  dataRecords: Record<string, unknown>[],
  aggregations: Aggregation[]
): Record<string, number> {
  const results: Record<string, number> = {}

  for (const aggregation of aggregations) {
    const { field, operation } = aggregation
    const values: number[] = []

    // Extract numeric values for the field
    for (const record of dataRecords) {
      const value = record[field]
      if (typeof value === 'number' && !isNaN(value)) {
        values.push(value)
      } else if (typeof value === 'string') {
        const numValue = Number(value)
        if (!isNaN(numValue)) {
          values.push(numValue)
        }
      }
    }

    const key = `${field}_${operation}`

    switch (operation) {
      case 'sum':
        results[key] = values.reduce((acc, val) => acc + val, 0)
        break
      case 'avg':
        results[key] = values.length > 0 ? values.reduce((acc, val) => acc + val, 0) / values.length : 0
        break
      case 'min':
        results[key] = values.length > 0 ? Math.min(...values) : 0
        break
      case 'max':
        results[key] = values.length > 0 ? Math.max(...values) : 0
        break
      case 'count':
        results[key] = values.length
        break
    }
  }

  return results
}
