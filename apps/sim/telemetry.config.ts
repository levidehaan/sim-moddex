/**
 * Sim OpenTelemetry Configuration
 *
 * PRIVACY NOTICE:
 * - Telemetry is DISABLED by default for privacy
 * - To enable telemetry, set TELEMETRY_ENDPOINT to your own collector
 * - You can use any OTLP-compatible backend (Jaeger, Grafana Tempo, etc.)
 *
 * If you want to collect telemetry for your own instance:
 * 1. Set TELEMETRY_ENDPOINT environment variable to your collector URL
 * 2. Set NEXT_TELEMETRY_DISABLED=0 to enable telemetry
 */
import { env } from './lib/core/config/env'

const config = {
  /**
   * OTLP Endpoint URL where telemetry data is sent
   * Set this to your own collector URL to enable telemetry
   * Telemetry is disabled if no endpoint is configured
   */
  endpoint: env.TELEMETRY_ENDPOINT || '',

  /**
   * Service name used to identify this instance
   */
  serviceName: 'sim-studio',

  /**
   * Version of the service
   */
  serviceVersion: '0.1.0',

  /**
   * Batch settings for OpenTelemetry BatchSpanProcessor
   */
  batchSettings: {
    maxQueueSize: 2048,
    maxExportBatchSize: 512,
    scheduledDelayMillis: 5000,
    exportTimeoutMillis: 30000,
  },

  /**
   * Sampling configuration
   */
  sampling: {
    defaultRate: 0.1,
    alwaysSampleErrors: true,
    alwaysSampleAI: true,
  },

  /**
   * Categories of events that can be collected
   */
  allowedCategories: [
    'page_view',
    'feature_usage',
    'performance',
    'error',
    'workflow',
    'consent',
    'batch',
  ],

  /**
   * Client-side instrumentation settings
   * Disabled by default - enable by setting a TELEMETRY_ENDPOINT
   */
  clientSide: {
    enabled: false,
    batchIntervalMs: 10000,
    maxBatchSize: 50,
  },

  /**
   * Server-side instrumentation settings
   * Disabled by default - enable by setting a TELEMETRY_ENDPOINT
   */
  serverSide: {
    enabled: false,
  },
}

export default config
