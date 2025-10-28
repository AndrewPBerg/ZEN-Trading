import { useIsMobile, useIsTablet, useIsDesktop, useDeviceType } from '@/hooks/use-mobile'

// Utility function to generate responsive classes based on device type
export function useResponsiveClasses() {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isDesktop = useIsDesktop()
  const deviceType = useDeviceType()

  const getResponsiveClass = (mobile: string, tablet?: string, desktop?: string) => {
    if (isMobile) return mobile
    if (isTablet) return tablet || mobile
    if (isDesktop) return desktop || tablet || mobile
    return mobile // fallback
  }

  const getResponsiveValue = <T>(mobile: T, tablet?: T, desktop?: T): T => {
    if (isMobile) return mobile
    if (isTablet) return tablet !== undefined ? tablet : mobile
    if (isDesktop) return desktop !== undefined ? desktop : tablet !== undefined ? tablet : mobile
    return mobile // fallback
  }

  // Common responsive patterns
  const spacing = {
    padding: {
      small: getResponsiveClass('p-2', 'p-3', 'p-4'),
      medium: getResponsiveClass('p-3', 'p-4', 'p-6'),
      large: getResponsiveClass('p-4', 'p-6', 'p-8'),
    },
    margin: {
      small: getResponsiveClass('m-2', 'm-3', 'm-4'),
      medium: getResponsiveClass('m-3', 'm-4', 'm-6'),
      large: getResponsiveClass('m-4', 'm-6', 'm-8'),
    },
    gap: {
      small: getResponsiveClass('gap-1', 'gap-2', 'gap-3'),
      medium: getResponsiveClass('gap-2', 'gap-3', 'gap-4'),
      large: getResponsiveClass('gap-3', 'gap-4', 'gap-6'),
    }
  }

  const text = {
    size: {
      xs: getResponsiveClass('text-xs', 'text-xs', 'text-sm'),
      sm: getResponsiveClass('text-xs', 'text-sm', 'text-base'),
      base: getResponsiveClass('text-sm', 'text-base', 'text-lg'),
      lg: getResponsiveClass('text-base', 'text-lg', 'text-xl'),
      xl: getResponsiveClass('text-lg', 'text-xl', 'text-2xl'),
      '2xl': getResponsiveClass('text-xl', 'text-2xl', 'text-3xl'),
      '3xl': getResponsiveClass('text-2xl', 'text-3xl', 'text-4xl'),
      '4xl': getResponsiveClass('text-3xl', 'text-4xl', 'text-5xl'),
    }
  }

  const layout = {
    flex: {
      row: getResponsiveClass('flex-col', 'flex-row', 'flex-row'),
      column: getResponsiveClass('flex-col', 'flex-col', 'flex-col'),
      wrap: getResponsiveClass('flex-wrap', 'flex-nowrap', 'flex-nowrap'),
    },
    grid: {
      cols: {
        '1': 'grid-cols-1',
        '2': getResponsiveClass('grid-cols-1', 'grid-cols-2', 'grid-cols-2'),
        '3': getResponsiveClass('grid-cols-1', 'grid-cols-2', 'grid-cols-3'),
        '4': getResponsiveClass('grid-cols-2', 'grid-cols-3', 'grid-cols-4'),
      }
    }
  }

  const sizing = {
    width: {
      full: 'w-full',
      auto: 'w-auto',
      fit: 'w-fit',
      screen: 'w-screen',
      container: getResponsiveClass('w-full', 'w-full', 'max-w-7xl'),
    },
    height: {
      full: 'h-full',
      screen: 'h-screen',
      minScreen: 'min-h-screen',
      auto: 'h-auto',
    },
    icon: {
      small: getResponsiveClass('w-3 h-3', 'w-4 h-4', 'w-4 h-4'),
      medium: getResponsiveClass('w-4 h-4', 'w-5 h-5', 'w-6 h-6'),
      large: getResponsiveClass('w-6 h-6', 'w-8 h-8', 'w-10 h-10'),
    }
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    deviceType,
    getResponsiveClass,
    getResponsiveValue,
    spacing,
    text,
    layout,
    sizing,
  }
}

// Hook for common responsive patterns
export function useResponsiveLayout() {
  const { isMobile, isTablet, isDesktop, getResponsiveClass, getResponsiveValue } = useResponsiveClasses()

  return {
    // Container classes
    container: getResponsiveClass('px-4', 'px-6', 'px-8'),
    containerPadding: getResponsiveClass('pt-16', 'pt-20', 'pt-20'),
    
    // Card classes
    cardPadding: getResponsiveClass('p-3', 'p-4', 'p-6'),
    cardGap: getResponsiveClass('gap-2', 'gap-3', 'gap-4'),
    
    // Button classes
    buttonPadding: getResponsiveClass('py-3', 'py-4', 'py-4'),
    buttonText: getResponsiveClass('text-sm', 'text-base', 'text-base'),
    
    // Icon classes
    iconSmall: getResponsiveClass('w-3 h-3', 'w-4 h-4', 'w-4 h-4'),
    iconMedium: getResponsiveClass('w-4 h-4', 'w-5 h-5', 'w-6 h-6'),
    iconLarge: getResponsiveClass('w-6 h-6', 'w-8 h-8', 'w-10 h-10'),
    
    // Text classes
    heading: getResponsiveClass('text-2xl', 'text-3xl', 'text-4xl'),
    subheading: getResponsiveClass('text-lg', 'text-xl', 'text-2xl'),
    body: getResponsiveClass('text-sm', 'text-base', 'text-lg'),
    caption: getResponsiveClass('text-xs', 'text-sm', 'text-sm'),
    
    // Layout classes
    flexDirection: getResponsiveClass('flex-col', 'flex-row', 'flex-row'),
    gridCols: getResponsiveClass('grid-cols-1', 'grid-cols-2', 'grid-cols-3'),
    
    // Spacing classes
    spaceY: getResponsiveClass('space-y-3', 'space-y-4', 'space-y-6'),
    spaceX: getResponsiveClass('space-x-2', 'space-x-3', 'space-x-4'),
  }
}