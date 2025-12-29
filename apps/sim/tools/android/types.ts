import type { ToolResponse } from '@/tools/types'

/**
 * Android environment detection result
 */
export interface AndroidEnvironment {
  isTermux: boolean
  hasTermuxApi: boolean
  hasAdb: boolean
  androidVersion?: string
  deviceModel?: string
  termuxVersion?: string
}

/**
 * Sensor data structure
 */
export interface SensorData {
  name: string
  values: number[]
  timestamp: number
}

/**
 * Available sensor types from Termux:API
 */
export type SensorType =
  | 'accelerometer'
  | 'gyroscope'
  | 'light'
  | 'proximity'
  | 'gravity'
  | 'linear_acceleration'
  | 'rotation_vector'
  | 'magnetic_field'
  | 'pressure'
  | 'ambient_temperature'
  | 'relative_humidity'
  | 'step_counter'

/**
 * Parameters for reading sensor data
 */
export interface AndroidSensorParams {
  sensor: SensorType
  delay?: 'fastest' | 'game' | 'ui' | 'normal'
  duration?: number // milliseconds to collect data
}

/**
 * Response from sensor reading
 */
export interface AndroidSensorResponse extends ToolResponse {
  output: {
    sensor: string
    readings: SensorData[]
    message: string
  }
}

/**
 * Parameters for sending notifications
 */
export interface AndroidNotificationParams {
  title: string
  content: string
  id?: string
  priority?: 'high' | 'default' | 'low' | 'min' | 'max'
  sound?: boolean
  vibrate?: boolean
  led?: boolean
  ledColor?: string
  ledOnMs?: number
  ledOffMs?: number
  group?: string
  imageUrl?: string
  actionLabel?: string
  actionCommand?: string
}

/**
 * Response from notification
 */
export interface AndroidNotificationResponse extends ToolResponse {
  output: {
    id: string
    message: string
  }
}

/**
 * Parameters for sending SMS
 */
export interface AndroidSmsParams {
  recipient: string
  message: string
}

/**
 * Response from SMS
 */
export interface AndroidSmsResponse extends ToolResponse {
  output: {
    recipient: string
    message: string
    status: 'sent' | 'failed'
  }
}

/**
 * Parameters for getting location
 */
export interface AndroidLocationParams {
  provider?: 'gps' | 'network' | 'passive'
  request?: 'once' | 'last' | 'updates'
}

/**
 * Response from location
 */
export interface AndroidLocationResponse extends ToolResponse {
  output: {
    latitude: number
    longitude: number
    altitude?: number
    accuracy?: number
    bearing?: number
    speed?: number
    provider: string
    timestamp: string
  }
}

/**
 * Parameters for clipboard operations
 */
export interface AndroidClipboardParams {
  operation: 'get' | 'set'
  text?: string
}

/**
 * Response from clipboard operations
 */
export interface AndroidClipboardResponse extends ToolResponse {
  output: {
    text: string
    message: string
  }
}

/**
 * Response from battery status
 */
export interface AndroidBatteryResponse extends ToolResponse {
  output: {
    health: string
    percentage: number
    plugged: string
    status: string
    temperature: number
    current: number
  }
}

/**
 * Parameters for vibration
 */
export interface AndroidVibrateParams {
  duration?: number // milliseconds
  pattern?: number[] // vibration pattern [wait, vibrate, wait, vibrate, ...]
  force?: boolean
}

/**
 * Response from vibration
 */
export interface AndroidVibrateResponse extends ToolResponse {
  output: {
    message: string
  }
}

/**
 * Parameters for text-to-speech
 */
export interface AndroidTtsParams {
  text: string
  language?: string
  pitch?: number
  rate?: number
  engine?: string
}

/**
 * Response from TTS
 */
export interface AndroidTtsResponse extends ToolResponse {
  output: {
    text: string
    message: string
  }
}

/**
 * WiFi network information
 */
export interface WifiNetwork {
  ssid: string
  bssid: string
  frequency: number
  level: number
  security: string
}

/**
 * Parameters for WiFi operations
 */
export interface AndroidWifiParams {
  operation: 'scan' | 'info' | 'enable' | 'disable'
}

/**
 * Response from WiFi operations
 */
export interface AndroidWifiResponse extends ToolResponse {
  output: {
    connected: boolean
    ssid?: string
    bssid?: string
    ipAddress?: string
    linkSpeed?: number
    networks?: WifiNetwork[]
    message: string
  }
}

/**
 * Parameters for running shell commands (Termux or ADB)
 */
export interface AndroidShellParams {
  command: string
  timeout?: number
  useAdb?: boolean
  adbSerial?: string
}

/**
 * Response from shell commands
 */
export interface AndroidShellResponse extends ToolResponse {
  output: {
    stdout: string
    stderr: string
    exitCode: number
    message: string
  }
}

/**
 * Parameters for launching apps via intent
 */
export interface AndroidIntentParams {
  action?: string
  package?: string
  component?: string
  data?: string
  type?: string
  extras?: Record<string, string | number | boolean>
  category?: string
  flags?: string[]
}

/**
 * Response from intent launch
 */
export interface AndroidIntentResponse extends ToolResponse {
  output: {
    success: boolean
    package?: string
    message: string
  }
}

/**
 * Parameters for file system operations
 */
export interface AndroidFileParams {
  operation: 'read' | 'write' | 'list' | 'delete' | 'exists' | 'mkdir'
  path: string
  content?: string
  encoding?: 'utf8' | 'base64'
}

/**
 * Response from file operations
 */
export interface AndroidFileResponse extends ToolResponse {
  output: {
    path: string
    content?: string
    files?: string[]
    exists?: boolean
    message: string
  }
}

/**
 * Contacts structure
 */
export interface Contact {
  name: string
  number?: string
  email?: string
}

/**
 * Response from contacts
 */
export interface AndroidContactsResponse extends ToolResponse {
  output: {
    contacts: Contact[]
    count: number
    message: string
  }
}

/**
 * Parameters for camera capture
 */
export interface AndroidCameraParams {
  cameraId?: number
  outputPath?: string
}

/**
 * Response from camera
 */
export interface AndroidCameraResponse extends ToolResponse {
  output: {
    path: string
    message: string
  }
}

/**
 * Parameters for audio recording
 */
export interface AndroidMicrophoneParams {
  duration: number // seconds
  outputPath?: string
  limit?: number // file size limit in KB
  encoder?: 'aac' | 'amr_nb' | 'amr_wb'
  sampleRate?: number
  bitrate?: number
}

/**
 * Response from microphone
 */
export interface AndroidMicrophoneResponse extends ToolResponse {
  output: {
    path: string
    duration: number
    message: string
  }
}
