import { createElement } from 'react'
import type { SVGProps } from 'react'
import { Landmark } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'

const CongressIcon = (props: SVGProps<SVGSVGElement>) => createElement(Landmark, props)

export const CongressBlock: BlockConfig = {
  type: 'congress',
  name: 'Congress.gov',
  description: 'U.S. Congressional data and legislation',
  longDescription:
    'Access the Congress.gov API for bills, amendments, members, committees, nominations, and more. Free tier offers 5,000 calls/hour with API key. Essential for government affairs, policy tracking, and civic automation.',
  category: 'tools',
  bgColor: '#002868',
  icon: CongressIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Search Bills', id: 'bills' },
        { label: 'Get Bill Details', id: 'bill_details' },
        { label: 'Get Bill Actions', id: 'bill_actions' },
        { label: 'Get Bill Amendments', id: 'bill_amendments' },
        { label: 'Get Bill Cosponsors', id: 'bill_cosponsors' },
        { label: 'Get Bill Summaries', id: 'bill_summaries' },
        { label: 'Search Members', id: 'members' },
        { label: 'Get Member Details', id: 'member_details' },
        { label: 'Get Committees', id: 'committees' },
        { label: 'Get Committee Details', id: 'committee_details' },
        { label: 'Get Nominations', id: 'nominations' },
        { label: 'Get Treaties', id: 'treaties' },
      ],
      value: () => 'bills',
    },
    {
      id: 'apiKey',
      title: 'API Key',
      type: 'short-input',
      placeholder: 'Enter your Congress.gov API key',
      password: true,
      required: true,
      connectionDroppable: false,
    },
    {
      id: 'congress',
      title: 'Congress Number',
      type: 'short-input',
      placeholder: 'e.g., 118 for 118th Congress',
      description: 'Congress session number (current is 118)',
    },
    {
      id: 'billNumber',
      title: 'Bill Number',
      type: 'short-input',
      placeholder: 'e.g., hr1234, s5678',
      description: 'Bill number (hr for House, s for Senate)',
      condition: {
        field: 'operation',
        value: ['bill_details', 'bill_actions', 'bill_amendments', 'bill_cosponsors', 'bill_summaries'],
      },
    },
    {
      id: 'memberId',
      title: 'Member ID',
      type: 'short-input',
      placeholder: 'e.g., B000944',
      description: 'Bioguide ID of the member',
      condition: {
        field: 'operation',
        value: ['member_details'],
      },
    },
    {
      id: 'committeeCode',
      title: 'Committee Code',
      type: 'short-input',
      placeholder: 'e.g., SSAF',
      description: 'Committee code',
      condition: {
        field: 'operation',
        value: ['committee_details'],
      },
    },
    {
      id: 'query',
      title: 'Search Query',
      type: 'short-input',
      placeholder: 'e.g., climate change, healthcare',
      description: 'Search terms',
      condition: {
        field: 'operation',
        value: ['bills', 'members'],
      },
    },
    {
      id: 'chamber',
      title: 'Chamber',
      type: 'dropdown',
      options: [
        { label: 'Both', id: '' },
        { label: 'House', id: 'house' },
        { label: 'Senate', id: 'senate' },
      ],
      value: () => '',
      condition: {
        field: 'operation',
        value: ['bills', 'committees'],
      },
    },
    {
      id: 'state',
      title: 'State',
      type: 'short-input',
      placeholder: 'e.g., CA, NY, TX',
      description: 'Two-letter state code',
      condition: {
        field: 'operation',
        value: ['members'],
      },
    },
    {
      id: 'limit',
      title: 'Limit',
      type: 'short-input',
      placeholder: '20',
      description: 'Maximum number of results (max 250)',
    },
    {
      id: 'offset',
      title: 'Offset',
      type: 'short-input',
      placeholder: '0',
      description: 'Number of results to skip (for pagination)',
    },
  ],
  tools: {
    access: ['congress_api'],
    config: {
      tool: () => 'congress_api',
      params: (params) => {
        const result: Record<string, unknown> = {
          operation: params.operation || 'bills',
          apiKey: params.apiKey,
        }

        if (params.congress) result.congress = params.congress
        if (params.billNumber) result.billNumber = params.billNumber
        if (params.memberId) result.memberId = params.memberId
        if (params.committeeCode) result.committeeCode = params.committeeCode
        if (params.query) result.query = params.query
        if (params.chamber) result.chamber = params.chamber
        if (params.state) result.state = params.state
        if (params.limit) result.limit = Number(params.limit)
        if (params.offset) result.offset = Number(params.offset)

        return result
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    apiKey: { type: 'string', description: 'Congress.gov API key' },
    congress: { type: 'string', description: 'Congress session number' },
    billNumber: { type: 'string', description: 'Bill number' },
    memberId: { type: 'string', description: 'Member bioguide ID' },
    committeeCode: { type: 'string', description: 'Committee code' },
    query: { type: 'string', description: 'Search query' },
    chamber: { type: 'string', description: 'Legislative chamber' },
    state: { type: 'string', description: 'State code' },
    limit: { type: 'number', description: 'Maximum results' },
    offset: { type: 'number', description: 'Results to skip' },
  },
  outputs: {
    success: { type: 'boolean', description: 'Whether the request succeeded' },
    results: { type: 'array', description: 'Search results' },
    bill: { type: 'json', description: 'Bill details' },
    member: { type: 'json', description: 'Member details' },
    committee: { type: 'json', description: 'Committee details' },
    pagination: { type: 'json', description: 'Pagination information' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
