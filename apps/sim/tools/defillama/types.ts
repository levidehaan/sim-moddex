export type DeFiLlamaOperation =
  | 'protocols'
  | 'protocol_tvl'
  | 'chain_tvl'
  | 'chains'
  | 'chain_history'
  | 'yields'
  | 'stablecoins'
  | 'bridges'
  | 'dex_volumes'
  | 'fees'

export interface DeFiLlamaToolParams {
  operation: DeFiLlamaOperation
  protocol?: string
  chain?: string
  stablecoinId?: string
  bridgeId?: string
}

export interface DeFiLlamaProtocol {
  id: string
  name: string
  address: string | null
  symbol: string
  url: string
  description: string
  chain: string
  logo: string
  audits: string
  audit_note: string | null
  gecko_id: string | null
  cmcId: string | null
  category: string
  chains: string[]
  module: string
  twitter: string | null
  forkedFrom: string[]
  oracles: string[]
  listedAt: number
  methodology: string
  slug: string
  tvl: number
  chainTvls: Record<string, number>
  change_1h: number | null
  change_1d: number | null
  change_7d: number | null
  tokenBreakdowns: Record<string, unknown>
  mcap: number | null
}

export interface DeFiLlamaChain {
  gecko_id: string | null
  tvl: number
  tokenSymbol: string | null
  cmcId: string | null
  name: string
  chainId: number | null
}

export interface DeFiLlamaYield {
  chain: string
  project: string
  symbol: string
  tvlUsd: number
  apyBase: number | null
  apyReward: number | null
  apy: number
  rewardTokens: string[] | null
  pool: string
  apyPct1D: number | null
  apyPct7D: number | null
  apyPct30D: number | null
  stablecoin: boolean
  ilRisk: string
  exposure: string
  predictions: {
    predictedClass: string
    predictedProbability: number
    binnedConfidence: number
  }
  poolMeta: string | null
  mu: number
  sigma: number
  count: number
  outlier: boolean
  underlyingTokens: string[] | null
  il7d: number | null
  apyBase7d: number | null
  apyMean30d: number | null
  volumeUsd1d: number | null
  volumeUsd7d: number | null
}

export interface DeFiLlamaStablecoin {
  id: string
  name: string
  symbol: string
  gecko_id: string
  pegType: string
  pegMechanism: string
  circulating: Record<string, number>
  circulatingPrevDay: Record<string, number>
  circulatingPrevWeek: Record<string, number>
  circulatingPrevMonth: Record<string, number>
  chainCirculating: Record<string, { current: number; circulatingPrevDay: number }>
  price: number
  priceSource: string
}

export interface DeFiLlamaBridge {
  id: number
  name: string
  displayName: string
  icon: string
  volumePrevDay: number
  volumePrev2Day: number
  lastHourlyVolume: number
  currentDayVolume: number
  lastDailyVolume: number
  dayBeforeLastVolume: number
  weeklyVolume: number
  monthlyVolume: number
  chains: string[]
  destinationChain: string | null
}

export interface DeFiLlamaDexVolume {
  totalDataChart: Array<[number, number]>
  totalDataChartBreakdown: Array<{
    date: number
    [key: string]: number
  }>
  protocols: Array<{
    name: string
    disabled: boolean
    displayName: string
    module: string
    category: string
    logo: string
    change_1d: number | null
    change_7d: number | null
    change_1m: number | null
    change_7dover7d: number | null
    total24h: number | null
    total48hto24h: number | null
    total7d: number | null
    totalAllTime: number | null
    breakdown24h: Record<string, Record<string, number>> | null
    chains: string[]
    protocolType: string
    methodologyURL: string
    methodology: Record<string, string>
    latestFetchIsOk: boolean
    versionKey: string | null
  }>
  allChains: string[]
  total24h: number
  total48hto24h: number
  total7d: number
  total30d: number
  totalAllTime: number
  change_1d: number
  change_7d: number
  change_1m: number
  change_7dover7d: number
}

export interface DeFiLlamaFees {
  totalDataChart: Array<[number, number]>
  protocols: Array<{
    name: string
    displayName: string
    module: string
    category: string
    logo: string
    chains: string[]
    total24h: number | null
    total48hto24h: number | null
    total7d: number | null
    totalAllTime: number | null
    revenue24h: number | null
    revenue7d: number | null
    dailyRevenue: number | null
  }>
  allChains: string[]
  total24h: number
  total48hto24h: number
  total7d: number
  totalAllTime: number
}

export interface DeFiLlamaToolResponse {
  success: boolean
  output: {
    protocols?: DeFiLlamaProtocol[]
    protocol?: DeFiLlamaProtocol
    chains?: DeFiLlamaChain[]
    chainTvl?: { tvl: number; name: string }
    chainHistory?: Array<{ date: number; tvl: number }>
    yields?: DeFiLlamaYield[]
    stablecoins?: DeFiLlamaStablecoin[]
    bridges?: DeFiLlamaBridge[]
    dexVolumes?: DeFiLlamaDexVolume
    fees?: DeFiLlamaFees
    error?: string
  }
}
