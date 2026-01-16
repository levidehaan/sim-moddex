import { Wallet } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'

export const DeFiLlamaBlock: BlockConfig = {
  type: 'defillama',
  name: 'DeFiLlama',
  description: 'DeFi protocol data, TVL, and yields',
  longDescription:
    'Access the DeFiLlama API for DeFi protocol analytics, Total Value Locked (TVL), yield farming opportunities, stablecoin data, and bridge information. Completely free with no authentication required. Great for DeFi research and monitoring.',
  category: 'tools',
  bgColor: '#2172E5',
  icon: Wallet,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'List All Protocols', id: 'protocols' },
        { label: 'Get Protocol TVL', id: 'protocol_tvl' },
        { label: 'Get Chain TVL', id: 'chain_tvl' },
        { label: 'List All Chains', id: 'chains' },
        { label: 'Get Historical Chain TVL', id: 'chain_history' },
        { label: 'Get Yields/Pools', id: 'yields' },
        { label: 'Get Stablecoins', id: 'stablecoins' },
        { label: 'Get Bridges', id: 'bridges' },
        { label: 'Get DEX Volumes', id: 'dex_volumes' },
        { label: 'Get Fees/Revenue', id: 'fees' },
      ],
      value: () => 'protocols',
    },
    {
      id: 'protocol',
      title: 'Protocol Slug',
      type: 'short-input',
      placeholder: 'e.g., aave, uniswap, lido',
      description: 'Protocol identifier (slug)',
      condition: { field: 'operation', value: 'protocol_tvl' },
    },
    {
      id: 'chain',
      title: 'Chain',
      type: 'short-input',
      placeholder: 'e.g., ethereum, arbitrum, polygon',
      description: 'Blockchain name',
    },
    {
      id: 'stablecoinId',
      title: 'Stablecoin ID',
      type: 'short-input',
      placeholder: 'e.g., 1 (USDT), 2 (USDC)',
      description: 'Stablecoin ID for detailed data',
      condition: { field: 'operation', value: 'stablecoins' },
    },
    {
      id: 'bridgeId',
      title: 'Bridge ID',
      type: 'short-input',
      placeholder: 'e.g., 1',
      description: 'Bridge ID for detailed data',
      condition: { field: 'operation', value: 'bridges' },
    },
  ],
  tools: {
    access: ['defillama_api'],
    config: {
      tool: () => 'defillama_api',
      params: (params) => {
        const result: Record<string, unknown> = {
          operation: params.operation || 'protocols',
        }

        if (params.protocol) result.protocol = params.protocol
        if (params.chain) result.chain = params.chain
        if (params.stablecoinId) result.stablecoinId = params.stablecoinId
        if (params.bridgeId) result.bridgeId = params.bridgeId

        return result
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    protocol: { type: 'string', description: 'Protocol slug' },
    chain: { type: 'string', description: 'Blockchain name' },
    stablecoinId: { type: 'string', description: 'Stablecoin ID' },
    bridgeId: { type: 'string', description: 'Bridge ID' },
  },
  outputs: {
    success: { type: 'boolean', description: 'Whether the request succeeded' },
    protocols: { type: 'array', description: 'List of DeFi protocols' },
    protocol: { type: 'json', description: 'Protocol details with TVL' },
    chains: { type: 'array', description: 'List of chains' },
    chainTvl: { type: 'json', description: 'Chain TVL data' },
    chainHistory: { type: 'array', description: 'Historical chain TVL' },
    yields: { type: 'array', description: 'Yield farming pools' },
    stablecoins: { type: 'array', description: 'Stablecoin data' },
    bridges: { type: 'array', description: 'Bridge data' },
    dexVolumes: { type: 'json', description: 'DEX volume data' },
    fees: { type: 'json', description: 'Protocol fees and revenue' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
