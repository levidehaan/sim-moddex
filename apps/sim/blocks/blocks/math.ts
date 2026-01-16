import { createElement } from 'react'
import type { SVGProps } from 'react'
import { Calculator } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'

const MathIcon = (props: SVGProps<SVGSVGElement>) => createElement(Calculator, props)

export const MathBlock: BlockConfig = {
  type: 'math',
  name: 'Math',
  description: 'Perform mathematical calculations',
  longDescription:
    'Perform mathematical operations on numbers. Perfect for calculating strike prices, percentage changes, price offsets, and other numerical transformations in trading workflows.',
  docsLink: 'https://docs.sim.ai/blocks/math',
  category: 'blocks',
  bgColor: '#4CAF50',
  icon: MathIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Add (+)', id: 'add' },
        { label: 'Subtract (-)', id: 'subtract' },
        { label: 'Multiply (×)', id: 'multiply' },
        { label: 'Divide (÷)', id: 'divide' },
        { label: 'Percentage (%)', id: 'percentage' },
        { label: 'Percentage Change', id: 'percentage_change' },
        { label: 'Round', id: 'round' },
        { label: 'Floor', id: 'floor' },
        { label: 'Ceiling', id: 'ceiling' },
        { label: 'Absolute Value', id: 'abs' },
        { label: 'Power (^)', id: 'power' },
        { label: 'Square Root', id: 'sqrt' },
        { label: 'Min', id: 'min' },
        { label: 'Max', id: 'max' },
      ],
      value: () => 'add',
    },
    {
      id: 'value1',
      title: 'Value 1',
      type: 'short-input',
      placeholder: 'Enter first number',
      required: true,
    },
    {
      id: 'value2',
      title: 'Value 2',
      type: 'short-input',
      placeholder: 'Enter second number',
      condition: {
        field: 'operation',
        value: ['add', 'subtract', 'multiply', 'divide', 'percentage', 'percentage_change', 'power', 'min', 'max'],
      },
    },
    {
      id: 'decimals',
      title: 'Decimal Places',
      type: 'short-input',
      placeholder: '2',
      condition: {
        field: 'operation',
        value: ['round'],
      },
    },
  ],
  tools: {
    access: ['math_calculate'],
  },
  inputs: {
    operation: { type: 'string', description: 'Mathematical operation to perform' },
    value1: { type: 'number', description: 'First value' },
    value2: { type: 'number', description: 'Second value' },
    decimals: { type: 'number', description: 'Number of decimal places for rounding' },
  },
  outputs: {
    result: { type: 'number', description: 'Calculation result' },
    formatted: { type: 'string', description: 'Formatted result as string' },
  },
}
