'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * Device type categorization
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop'

/**
 * Platform detection
 */
export type Platform = 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'unknown'

/**
 * Android-specific capabilities detected from Termux environment
 */
export interface AndroidCapabilities {
  isTermux: boolean
  hasTermuxApi: boolean
  hasAdb: boolean
  termuxVersion?: string
}

/**
 * Comprehensive device information
 */
export interface DeviceInfo {
  type: DeviceType
  platform: Platform
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isAndroid: boolean
  isIOS: boolean
  isTouchDevice: boolean
  screenWidth: number
  screenHeight: number
  pixelRatio: number
  orientation: 'portrait' | 'landscape'
  android?: AndroidCapabilities
  userAgent: string
}

/**
 * Breakpoints for responsive design (matches common Tailwind breakpoints)
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

/**
 * Detects the platform from user agent
 */
function detectPlatform(userAgent: string): Platform {
  const ua = userAgent.toLowerCase()

  if (/android/.test(ua)) return 'android'
  if (/iphone|ipad|ipod/.test(ua)) return 'ios'
  if (/windows/.test(ua)) return 'windows'
  if (/macintosh|mac os x/.test(ua)) return 'macos'
  if (/linux/.test(ua)) return 'linux'

  return 'unknown'
}

/**
 * Detects device type based on screen size and user agent
 */
function detectDeviceType(width: number, userAgent: string): DeviceType {
  const ua = userAgent.toLowerCase()

  // Check for tablet indicators
  const isTabletUA = /ipad|tablet|playbook|silk/.test(ua)
  const isAndroidTablet = /android/.test(ua) && !/mobile/.test(ua)

  if (isTabletUA || isAndroidTablet) {
    return 'tablet'
  }

  // Check for mobile indicators
  const isMobileUA = /mobile|iphone|ipod|android.*mobile|blackberry|opera mini|iemobile/.test(ua)

  if (isMobileUA || width < BREAKPOINTS.md) {
    return 'mobile'
  }

  if (width < BREAKPOINTS.lg) {
    return 'tablet'
  }

  return 'desktop'
}

/**
 * Detects if touch is supported
 */
function detectTouchSupport(): boolean {
  if (typeof window === 'undefined') return false

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error - msMaxTouchPoints is IE-specific
    navigator.msMaxTouchPoints > 0
  )
}

/**
 * Gets the current screen orientation
 */
function getOrientation(): 'portrait' | 'landscape' {
  if (typeof window === 'undefined') return 'landscape'
  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
}

/**
 * Creates default device info for SSR
 */
function getDefaultDeviceInfo(): DeviceInfo {
  return {
    type: 'desktop',
    platform: 'unknown',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isAndroid: false,
    isIOS: false,
    isTouchDevice: false,
    screenWidth: 1920,
    screenHeight: 1080,
    pixelRatio: 1,
    orientation: 'landscape',
    userAgent: '',
  }
}

/**
 * Builds device info from current window state
 */
function buildDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return getDefaultDeviceInfo()
  }

  const userAgent = navigator.userAgent
  const platform = detectPlatform(userAgent)
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight
  const type = detectDeviceType(screenWidth, userAgent)

  const deviceInfo: DeviceInfo = {
    type,
    platform,
    isMobile: type === 'mobile',
    isTablet: type === 'tablet',
    isDesktop: type === 'desktop',
    isAndroid: platform === 'android',
    isIOS: platform === 'ios',
    isTouchDevice: detectTouchSupport(),
    screenWidth,
    screenHeight,
    pixelRatio: window.devicePixelRatio || 1,
    orientation: getOrientation(),
    userAgent,
  }

  // Add Android-specific capabilities if on Android
  if (platform === 'android') {
    deviceInfo.android = detectAndroidCapabilities(userAgent)
  }

  return deviceInfo
}

/**
 * Detects Android-specific capabilities
 * Note: Full detection requires server-side checks for Termux environment
 */
function detectAndroidCapabilities(userAgent: string): AndroidCapabilities {
  // Basic client-side detection - full detection happens server-side
  const isTermuxUserAgent = /termux/i.test(userAgent)

  return {
    isTermux: isTermuxUserAgent,
    hasTermuxApi: false, // Requires server-side check
    hasAdb: false, // Requires server-side check
  }
}

/**
 * Hook for device detection with SSR support
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isMobile, isAndroid, type } = useDevice()
 *
 *   if (isMobile) {
 *     return <MobileLayout />
 *   }
 *   return <DesktopLayout />
 * }
 * ```
 */
export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getDefaultDeviceInfo)

  const updateDeviceInfo = useCallback(() => {
    setDeviceInfo(buildDeviceInfo())
  }, [])

  useEffect(() => {
    // Initial detection
    updateDeviceInfo()

    // Listen for resize events
    window.addEventListener('resize', updateDeviceInfo)

    // Listen for orientation changes
    window.addEventListener('orientationchange', updateDeviceInfo)

    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
      window.removeEventListener('orientationchange', updateDeviceInfo)
    }
  }, [updateDeviceInfo])

  return deviceInfo
}

/**
 * Hook for checking if viewport matches a breakpoint
 *
 * @example
 * ```tsx
 * const isMdOrLarger = useBreakpoint('md')
 * const isLgOrLarger = useBreakpoint('lg')
 * ```
 */
export function useBreakpoint(breakpoint: keyof typeof BREAKPOINTS): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${BREAKPOINTS[breakpoint]}px)`)

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setMatches(e.matches)
    }

    // Initial check
    handleChange(mediaQuery)

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [breakpoint])

  return matches
}

/**
 * Hook for checking if device is mobile (under md breakpoint)
 */
export function useIsMobile(): boolean {
  const { isMobile } = useDevice()
  return isMobile
}

/**
 * Hook for checking if device supports touch
 */
export function useIsTouchDevice(): boolean {
  const { isTouchDevice } = useDevice()
  return isTouchDevice
}
