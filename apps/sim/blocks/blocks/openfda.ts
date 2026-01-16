import { Pill } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'

export const OpenFDABlock: BlockConfig = {
  type: 'openfda',
  name: 'OpenFDA',
  description: 'Drug and device safety data',
  longDescription:
    'Access the OpenFDA API for drug adverse events, recalls, labeling, medical device reports, and food safety data. Free tier offers 120,000 calls/day with API key (1,000 without). Essential for health automation and safety monitoring.',
  category: 'tools',
  bgColor: '#00558C',
  icon: Pill,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Drug Adverse Events', id: 'drug_event' },
        { label: 'Drug Labeling', id: 'drug_label' },
        { label: 'Drug Recalls (Enforcement)', id: 'drug_enforcement' },
        { label: 'Drug NDC Directory', id: 'drug_ndc' },
        { label: 'Device Adverse Events', id: 'device_event' },
        { label: 'Device Recalls', id: 'device_recall' },
        { label: 'Device 510k Clearances', id: 'device_510k' },
        { label: 'Food Recalls', id: 'food_enforcement' },
        { label: 'Food Adverse Events', id: 'food_event' },
      ],
      value: () => 'drug_event',
    },
    {
      id: 'apiKey',
      title: 'API Key (Optional)',
      type: 'short-input',
      placeholder: 'Enter your OpenFDA API key for higher limits',
      password: true,
      connectionDroppable: false,
    },
    {
      id: 'search',
      title: 'Search Query',
      type: 'short-input',
      placeholder: 'e.g., patient.drug.openfda.brand_name:"aspirin"',
      description: 'OpenFDA search query syntax',
    },
    {
      id: 'drugName',
      title: 'Drug Name',
      type: 'short-input',
      placeholder: 'e.g., aspirin, ibuprofen, metformin',
      description: 'Brand or generic drug name',
    },
    {
      id: 'manufacturer',
      title: 'Manufacturer',
      type: 'short-input',
      placeholder: 'e.g., Pfizer, Johnson & Johnson',
      description: 'Manufacturer name',
    },
    {
      id: 'reactionType',
      title: 'Reaction Type',
      type: 'short-input',
      placeholder: 'e.g., nausea, headache, death',
      description: 'Adverse reaction type',
      condition: { field: 'operation', value: 'drug_event' },
    },
    {
      id: 'recallClass',
      title: 'Recall Class',
      type: 'dropdown',
      options: [
        { label: 'All Classes', id: '' },
        { label: 'Class I (Dangerous)', id: 'Class I' },
        { label: 'Class II (May Cause Problems)', id: 'Class II' },
        { label: 'Class III (Not Likely Harmful)', id: 'Class III' },
      ],
      value: () => '',
    },
    {
      id: 'limit',
      title: 'Limit',
      type: 'short-input',
      placeholder: '10',
      description: 'Maximum number of results (max 1000)',
    },
    {
      id: 'skip',
      title: 'Skip',
      type: 'short-input',
      placeholder: '0',
      description: 'Number of results to skip (for pagination)',
    },
    {
      id: 'count',
      title: 'Count Field',
      type: 'short-input',
      placeholder: 'e.g., patient.reaction.reactionmeddrapt.exact',
      description: 'Field to count/aggregate (returns counts instead of records)',
    },
  ],
  tools: {
    access: ['openfda_api'],
    config: {
      tool: () => 'openfda_api',
      params: (params) => {
        const result: Record<string, unknown> = {
          operation: params.operation || 'drug_event',
        }

        if (params.apiKey) result.apiKey = params.apiKey
        if (params.search) result.search = params.search
        if (params.drugName) result.drugName = params.drugName
        if (params.manufacturer) result.manufacturer = params.manufacturer
        if (params.reactionType) result.reactionType = params.reactionType
        if (params.recallClass) result.recallClass = params.recallClass
        if (params.limit) result.limit = Number(params.limit)
        if (params.skip) result.skip = Number(params.skip)
        if (params.count) result.count = params.count

        return result
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    apiKey: { type: 'string', description: 'OpenFDA API key (optional)' },
    search: { type: 'string', description: 'Search query' },
    drugName: { type: 'string', description: 'Drug name' },
    manufacturer: { type: 'string', description: 'Manufacturer name' },
    reactionType: { type: 'string', description: 'Adverse reaction type' },
    recallClass: { type: 'string', description: 'Recall classification' },
    limit: { type: 'number', description: 'Maximum results' },
    skip: { type: 'number', description: 'Results to skip' },
    count: { type: 'string', description: 'Field to count' },
  },
  outputs: {
    success: { type: 'boolean', description: 'Whether the request succeeded' },
    results: { type: 'array', description: 'Search results' },
    meta: { type: 'json', description: 'Response metadata' },
    total: { type: 'number', description: 'Total matching records' },
    counts: { type: 'array', description: 'Count aggregation results' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
