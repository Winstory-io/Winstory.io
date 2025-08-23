import { useEffect } from 'react';
import { accessibilityConfig, applyAccessibilityFixes } from '@/lib/config/accessibility-config';

/**
 * Custom hook to fix thirdweb accessibility issues
 * This suppresses the "DialogContent requires DialogTitle" console warnings
 * that are known issues with thirdweb v4
 */
export function useAccessibilityFix() {
  useEffect(() => {
    // Store original console methods
    const originalError = console.error;
    const originalWarn = console.warn;
    
    // Override console.error to filter accessibility warnings
    console.error = (...args) => {
      const message = args[0];
      if (typeof message === 'string') {
        // Check if this is a known accessibility warning to suppress
        const shouldSuppress = accessibilityConfig.suppressWarnings.some(warning => 
          message.includes(warning)
        );
        
        if (shouldSuppress) {
          return; // Suppress this warning
        }
      }
      // Log all other errors normally
      originalError.apply(console, args);
    };

    // Override console.warn to filter accessibility warnings
    console.warn = (...args) => {
      const message = args[0];
      if (typeof message === 'string') {
        // Check if this is a known accessibility warning to suppress
        const shouldSuppress = accessibilityConfig.suppressWarnings.some(warning => 
          message.includes(warning)
        );
        
        if (shouldSuppress) {
          return; // Suppress this warning
        }
      }
      // Log all other warnings normally
      originalWarn.apply(console, args);
    };

    // Apply DOM accessibility fixes
    const cleanupAccessibility = applyAccessibilityFixes();

    // Cleanup function to restore original console methods and stop observer
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      cleanupAccessibility();
    };
  }, []);

  // Return a function to manually suppress specific warnings
  const suppressWarning = (warningType: string) => {
    const originalError = console.error;
    console.error = (...args) => {
      const message = args[0];
      if (typeof message === 'string' && message.includes(warningType)) {
        return; // Suppress this specific warning
      }
      originalError.apply(console, args);
    };
  };

  return { suppressWarning };
} 