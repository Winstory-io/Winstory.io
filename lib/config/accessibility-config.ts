/**
 * Accessibility configuration for thirdweb components
 * This helps resolve known accessibility issues with thirdweb v4
 */

export const accessibilityConfig = {
  // Suppress specific console warnings
  suppressWarnings: [
    'DialogContent requires a DialogTitle',
    'component to be accessible for screen reader users',
    'radix-ui.com/primitives/docs/components/dialog',
    'If you want to hide the DialogTitle',
    'you can wrap it with our VisuallyHidden component',
    'Failed to auto connect wallet',
    'Failed to auto connect to the wallet',
    'Failed to auto connect to the wallet.',
    'Failed to auto connect wallet.',
    'Failed to auto connect',
    'auto connect wallet',
    'auto connect to wallet',
    'wallet connection failed',
    'wallet auto connect',
    'wallet auto-connect',
    '[next-auth][error][CLIENT_FETCH_ERROR]',
    'next-auth.js.org/errors#client_fetch_error',
    'Failed to fetch'
  ],
  
  // Add ARIA labels for thirdweb components
  ariaLabels: {
    walletConnect: 'Wallet Connection Dialog',
    walletButton: 'Connect Wallet Button',
    walletModal: 'Wallet Selection Modal',
    walletList: 'Available Wallets List'
  },
  
  // Focus management settings
  focusManagement: {
    trapFocus: true,
    restoreFocus: true,
    autoFocus: false
  },
  
  // Screen reader announcements
  screenReader: {
    walletConnected: 'Wallet connected successfully',
    walletDisconnected: 'Wallet disconnected',
    walletConnecting: 'Connecting to wallet...',
    walletError: 'Error connecting to wallet'
  }
};

/**
 * Apply accessibility fixes to thirdweb components
 */
export function applyAccessibilityFixes() {
  // Add ARIA labels to thirdweb components when they render
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // Fix DialogContent accessibility
          const dialogContent = element.querySelector('[data-radix-dialog-content]');
          if (dialogContent && !dialogContent.getAttribute('aria-label')) {
            dialogContent.setAttribute('aria-label', accessibilityConfig.ariaLabels.walletConnect);
          }
          
          // Fix wallet buttons
          const walletButtons = element.querySelectorAll('[data-testid*="wallet"], [data-testid*="connect"]');
          walletButtons.forEach((button) => {
            if (!button.getAttribute('aria-label')) {
              button.setAttribute('aria-label', accessibilityConfig.ariaLabels.walletButton);
            }
          });
        }
      });
    });
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return () => observer.disconnect();
} 