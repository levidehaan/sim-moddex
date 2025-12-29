import { batteryTool } from './battery'
import { clipboardTool } from './clipboard'
import { locationTool } from './location'
import { notificationTool } from './notification'
import { sensorTool } from './sensor'
import { ttsTool } from './tts'
import { vibrateTool } from './vibrate'
import { wifiTool } from './wifi'

export const androidSensorTool = sensorTool
export const androidNotificationTool = notificationTool
export const androidBatteryTool = batteryTool
export const androidLocationTool = locationTool
export const androidClipboardTool = clipboardTool
export const androidVibrateTool = vibrateTool
export const androidTtsTool = ttsTool
export const androidWifiTool = wifiTool

export * from './types'
