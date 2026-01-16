import { createElement } from 'react'
import type { SVGProps } from 'react'
import { Braces } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'

const JsonIcon = (props: SVGProps<SVGSVGElement>) => createElement(Braces, props)

export const JsonTransformBlock: BlockConfig = {
  type: 'json_transform',
  name: 'JSON Transform',
  description: 'Transform and manipulate JSON data',
  longDescription:
    'Transform JSON data using JSONPath queries, extract values, modify fields, merge objects, and perform data transformations. Perfect for extracting specific values from API responses or preparing data for subsequent blocks.',
  docsLink: 'https://docs.sim.ai/blocks/json-transform',
  category: 'blocks',
  bgColor: '#FF6B35',
  icon: JsonIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Extract Value', id: 'extract' },
        { label: 'Set Value', id: 'set' },
        { label: 'Delete Field', id: 'delete' },
        { label: 'Merge Objects', id: 'merge' },
        { label: 'Map Array', id: 'map' },
        { label: 'Filter Array', id: 'filter' },
        { label: 'Parse JSON String', id: 'parse' },
        { label: 'Stringify to JSON', id: 'stringify' },
      ],
      value: () => 'extract',
    },
    {
      id: 'input',
      title: 'Input Data',
      type: 'long-input',
      placeholder: 'Enter JSON data or reference a previous block output',
      required: true,
    },
    {
      id: 'path',
      title: 'JSON Path',
      type: 'short-input',
      placeholder: 'e.g., data.price or items[0].value',
      condition: {
        field: 'operation',
        value: ['extract', 'set', 'delete'],
      },
    },
    {
      id: 'value',
      title: 'Value',
      type: 'short-input',
      placeholder: 'Value to set',
      condition: {
        field: 'operation',
        value: ['set'],
      },
    },
    {
      id: 'mergeWith',
      title: 'Merge With',
      type: 'long-input',
      placeholder: 'JSON object to merge',
      condition: {
        field: 'operation',
        value: ['merge'],
      },
    },
    {
      id: 'mapExpression',
      title: 'Map Expression',
      type: 'short-input',
      placeholder: 'e.g., item.price * 1.1',
      condition: {
        field: 'operation',
        value: ['map'],
      },
    },
    {
      id: 'filterExpression',
      title: 'Filter Expression',
      type: 'short-input',
      placeholder: 'e.g., item.price > 100',
      condition: {
        field: 'operation',
        value: ['filter'],
      },
    },
  ],
  tools: {
    access: ['json_transform_execute'],
  },
  inputs: {
    operation: { type: 'string', description: 'Transformation operation' },
    input: { type: 'json', description: 'Input JSON data' },
    path: { type: 'string', description: 'JSON path for extraction/modification' },
    value: { type: 'json', description: 'Value to set' },
    mergeWith: { type: 'json', description: 'Object to merge with' },
    mapExpression: { type: 'string', description: 'Expression for mapping array items' },
    filterExpression: { type: 'string', description: 'Expression for filtering array items' },
  },
  outputs: {
    result: { type: 'json', description: 'Transformed JSON data' },
    success: { type: 'boolean', description: 'Whether transformation succeeded' },
  },
}
