'use client'

import { createContext, type ReactNode, useContext } from 'react'
import { type DeviceInfo, useDevice } from '@/hooks/use-device'

/**
 * Context for device information throughout the app
 */
const DeviceContext = createContext<DeviceInfo | null>(null)

/**
 * Provider component that makes device info available to children
 */
export function MobileDetectionProvider({ children }: { children: ReactNode }) {
  const deviceInfo = useDevice()

  return <DeviceContext.Provider value={deviceInfo}>{children}</DeviceContext.Provider>
}

/**
 * Hook to access device info from context
 */
export function useDeviceContext(): DeviceInfo {
  const context = useContext(DeviceContext)

  if (!context) {
    throw new Error('useDeviceContext must be used within a MobileDetectionProvider')
  }

  return context
}

/**
 * Component that only renders children on mobile devices
 */
export function MobileOnly({ children }: { children: ReactNode }) {
  const { isMobile } = useDevice()
  return isMobile ? <>{children}</> : null
}

/**
 * Component that only renders children on desktop devices
 */
export function DesktopOnly({ children }: { children: ReactNode }) {
  const { isDesktop } = useDevice()
  return isDesktop ? <>{children}</> : null
}

/**
 * Component that only renders children on tablet devices
 */
export function TabletOnly({ children }: { children: ReactNode }) {
  const { isTablet } = useDevice()
  return isTablet ? <>{children}</> : null
}

/**
 * Component that only renders children on touch devices
 */
export function TouchOnly({ children }: { children: ReactNode }) {
  const { isTouchDevice } = useDevice()
  return isTouchDevice ? <>{children}</> : null
}

/**
 * Component that only renders children on Android devices
 */
export function AndroidOnly({ children }: { children: ReactNode }) {
  const { isAndroid } = useDevice()
  return isAndroid ? <>{children}</> : null
}

/**
 * Component that only renders children on iOS devices
 */
export function IOSOnly({ children }: { children: ReactNode }) {
  const { isIOS } = useDevice()
  return isIOS ? <>{children}</> : null
}

/**
 * Responsive component that renders different content based on device type
 */
export function Responsive({
  mobile,
  tablet,
  desktop,
  fallback,
}: {
  mobile?: ReactNode
  tablet?: ReactNode
  desktop?: ReactNode
  fallback?: ReactNode
}) {
  const { type } = useDevice()

  switch (type) {
    case 'mobile':
      return <>{mobile ?? fallback}</>
    case 'tablet':
      return <>{tablet ?? fallback}</>
    case 'desktop':
      return <>{desktop ?? fallback}</>
    default:
      return <>{fallback}</>
  }
}
