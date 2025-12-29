import { AndroidIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'
import type { ToolResponse } from '@/tools/types'

interface AndroidBlockResponse extends ToolResponse {
  output: Record<string, unknown>
}

export const AndroidBlock: BlockConfig<AndroidBlockResponse> = {
  type: 'android',
  name: 'Android / Termux',
  description: 'Android device integration via Termux:API',
  longDescription:
    'Access Android device features including sensors, notifications, location, clipboard, WiFi, battery status, text-to-speech, and vibration. Requires Termux and Termux:API on Android.',
  docsLink: 'https://docs.sim.ai/tools/android',
  category: 'tools',
  bgColor: 'linear-gradient(45deg, #3DDC84 0%, #073042 100%)',
  icon: AndroidIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Read Sensor', id: 'sensor' },
        { label: 'Send Notification', id: 'notification' },
        { label: 'Get Battery Status', id: 'battery' },
        { label: 'Get Location', id: 'location' },
        { label: 'Clipboard', id: 'clipboard' },
        { label: 'Vibrate', id: 'vibrate' },
        { label: 'Text-to-Speech', id: 'tts' },
        { label: 'WiFi', id: 'wifi' },
      ],
      value: () => 'sensor',
    },
    // Sensor options
    {
      id: 'sensor',
      title: 'Sensor Type',
      type: 'dropdown',
      options: [
        { label: 'Accelerometer', id: 'accelerometer' },
        { label: 'Gyroscope', id: 'gyroscope' },
        { label: 'Light', id: 'light' },
        { label: 'Proximity', id: 'proximity' },
        { label: 'Magnetic Field', id: 'magnetic_field' },
        { label: 'Pressure', id: 'pressure' },
        { label: 'Gravity', id: 'gravity' },
        { label: 'Step Counter', id: 'step_counter' },
      ],
      condition: { field: 'operation', value: 'sensor' },
      required: true,
    },
    // Notification options
    {
      id: 'notificationTitle',
      title: 'Title',
      type: 'short-input',
      placeholder: 'Notification title',
      condition: { field: 'operation', value: 'notification' },
      required: true,
    },
    {
      id: 'notificationContent',
      title: 'Content',
      type: 'long-input',
      placeholder: 'Notification message content',
      condition: { field: 'operation', value: 'notification' },
      required: true,
    },
    {
      id: 'notificationPriority',
      title: 'Priority',
      type: 'dropdown',
      options: [
        { label: 'Default', id: 'default' },
        { label: 'High', id: 'high' },
        { label: 'Low', id: 'low' },
        { label: 'Max', id: 'max' },
        { label: 'Min', id: 'min' },
      ],
      defaultValue: 'default',
      condition: { field: 'operation', value: 'notification' },
      required: false,
    },
    // Location options
    {
      id: 'locationProvider',
      title: 'Location Provider',
      type: 'dropdown',
      options: [
        { label: 'GPS', id: 'gps' },
        { label: 'Network', id: 'network' },
        { label: 'Passive', id: 'passive' },
      ],
      defaultValue: 'gps',
      condition: { field: 'operation', value: 'location' },
      required: false,
    },
    // Clipboard options
    {
      id: 'clipboardOperation',
      title: 'Clipboard Action',
      type: 'dropdown',
      options: [
        { label: 'Get', id: 'get' },
        { label: 'Set', id: 'set' },
      ],
      defaultValue: 'get',
      condition: { field: 'operation', value: 'clipboard' },
      required: true,
    },
    {
      id: 'clipboardText',
      title: 'Text to Copy',
      type: 'long-input',
      placeholder: 'Text to copy to clipboard',
      condition: { field: 'operation', value: 'clipboard' },
      required: false,
    },
    // Vibrate options
    {
      id: 'vibrateDuration',
      title: 'Duration (ms)',
      type: 'short-input',
      placeholder: '1000',
      condition: { field: 'operation', value: 'vibrate' },
      required: false,
    },
    // TTS options
    {
      id: 'ttsText',
      title: 'Text to Speak',
      type: 'long-input',
      placeholder: 'Enter text to speak',
      condition: { field: 'operation', value: 'tts' },
      required: true,
    },
    {
      id: 'ttsLanguage',
      title: 'Language',
      type: 'short-input',
      placeholder: 'en-US',
      condition: { field: 'operation', value: 'tts' },
      required: false,
    },
    // WiFi options
    {
      id: 'wifiOperation',
      title: 'WiFi Action',
      type: 'dropdown',
      options: [
        { label: 'Get Info', id: 'info' },
        { label: 'Scan Networks', id: 'scan' },
        { label: 'Enable', id: 'enable' },
        { label: 'Disable', id: 'disable' },
      ],
      defaultValue: 'info',
      condition: { field: 'operation', value: 'wifi' },
      required: true,
    },
  ],
  tools: {
    access: [
      'android_sensor',
      'android_notification',
      'android_battery',
      'android_location',
      'android_clipboard',
      'android_vibrate',
      'android_tts',
      'android_wifi',
    ],
    config: {
      tool: (params) => {
        switch (params.operation) {
          case 'sensor':
            return 'android_sensor'
          case 'notification':
            return 'android_notification'
          case 'battery':
            return 'android_battery'
          case 'location':
            return 'android_location'
          case 'clipboard':
            return 'android_clipboard'
          case 'vibrate':
            return 'android_vibrate'
          case 'tts':
            return 'android_tts'
          case 'wifi':
            return 'android_wifi'
          default:
            throw new Error(`Invalid Android operation: ${params.operation}`)
        }
      },
      params: (params) => {
        switch (params.operation) {
          case 'sensor':
            return { sensor: params.sensor }
          case 'notification':
            return {
              title: params.notificationTitle,
              content: params.notificationContent,
              priority: params.notificationPriority,
            }
          case 'battery':
            return {}
          case 'location':
            return { provider: params.locationProvider }
          case 'clipboard':
            return {
              operation: params.clipboardOperation,
              text: params.clipboardText,
            }
          case 'vibrate':
            return {
              duration: params.vibrateDuration ? parseInt(params.vibrateDuration as string, 10) : undefined,
            }
          case 'tts':
            return {
              text: params.ttsText,
              language: params.ttsLanguage,
            }
          case 'wifi':
            return { operation: params.wifiOperation }
          default:
            return {}
        }
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Android operation to perform' },
    sensor: { type: 'string', description: 'Sensor type for sensor operation' },
    notificationTitle: { type: 'string', description: 'Notification title' },
    notificationContent: { type: 'string', description: 'Notification content' },
    notificationPriority: { type: 'string', description: 'Notification priority' },
    locationProvider: { type: 'string', description: 'Location provider' },
    clipboardOperation: { type: 'string', description: 'Clipboard operation (get/set)' },
    clipboardText: { type: 'string', description: 'Text for clipboard set' },
    vibrateDuration: { type: 'number', description: 'Vibration duration in ms' },
    ttsText: { type: 'string', description: 'Text to speak' },
    ttsLanguage: { type: 'string', description: 'TTS language code' },
    wifiOperation: { type: 'string', description: 'WiFi operation' },
  },
  outputs: {
    result: {
      type: 'object',
      description: 'Operation result (varies by operation type)',
    },
    message: {
      type: 'string',
      description: 'Status message',
    },
  },
}
