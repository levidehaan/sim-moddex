export interface HomeAssistantToolParams {
  operation: string
  baseUrl: string
  accessToken: string
  entityId?: string
  state?: string
  attributes?: any
  domain?: string
  service?: string
  serviceData?: any
  eventType?: string
  eventData?: any
}

export interface HomeAssistantToolResponse {
  success: boolean
  output: {
    states?: any[]
    state?: any
    services?: any
    config?: any
    events?: any[]
    error?: string
  }
}
