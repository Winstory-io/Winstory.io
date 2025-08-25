import { useEffect } from 'react';
import { accessibilityConfig } from '@/lib/config/accessibility-config';

export function useAccessibilityFix() {
  useEffect(() => {
    // Store original console methods
    const originalError = console.error;
    const originalWarn = console.warn;

    // Override console.error to filter accessibility warnings
    console.error = (...args) => {
      const message = args[0];
      
      // Check if this is a warning we want to suppress
      if (typeof message === 'string' && accessibilityConfig.suppressWarnings.some(warning => 
        message.includes(warning) || 
        message.toLowerCase().includes(warning.toLowerCase()) ||
        message.includes('Failed to auto connect') ||
        message.includes('wallet') ||
        message.includes('Wallet')
      )) {
        // Suppress the warning
        return;
      }
      
      // Log all other errors normally
      originalError.apply(console, args);
    };

    // Override console.warn to filter accessibility warnings
    console.warn = (...args) => {
      const message = args[0];
      
      // Check if this is a warning we want to suppress
      if (typeof message === 'string' && accessibilityConfig.suppressWarnings.some(warning => 
        message.includes(warning) || 
        message.toLowerCase().includes(warning.toLowerCase()) ||
        message.includes('Failed to auto connect') ||
        message.includes('wallet') ||
        message.includes('Wallet')
      )) {
        // Suppress the warning
        return;
      }
      
      // Log all other warnings normally
      originalWarn.apply(console, args);
    };

    // Cleanup function to restore original console methods
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Return a function to manually suppress specific warnings
  const suppressWarning = (message: string) => {
    if (accessibilityConfig.suppressWarnings.some(warning => 
      message.includes(warning) || 
      message.toLowerCase().includes(warning.toLowerCase()) ||
      message.includes('Failed to auto connect') ||
      message.includes('wallet') ||
      message.includes('Wallet')
    )) {
      return true; // Warning should be suppressed
    }
    return false; // Warning should be shown
  };

  return { suppressWarning };
} 