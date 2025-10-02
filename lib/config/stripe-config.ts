/**
 * Stripe Configuration for Winstory
 * Mode: Sandbox/Test to start, then Production
 */

export const STRIPE_CONFIG = {
  // Public keys (frontend)
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  
  // Payment configuration
  currency: 'usd',
  paymentMethods: ['card', 'paypal', 'google_pay', 'apple_pay'],
  
  // Redirect URLs
  successUrl: (flowType: 'b2c' | 'agencyb2c') => 
    `${process.env.NEXT_PUBLIC_APP_URL}/creation/${flowType}/thanks`,
  cancelUrl: (flowType: 'b2c' | 'agencyb2c') => 
    `${process.env.NEXT_PUBLIC_APP_URL}/creation/${flowType}/mint`,
  
  // Company information (for invoices)
  company: {
    name: process.env.COMPANY_NAME || 'Winstory',
    iban: process.env.COMPANY_IBAN || 'FR76 1741 8000 0100 0117 5195 874',
    bic: process.env.COMPANY_BIC || 'SNNNFR22XXX',
  },
  
  // Settlement period (in ms) - 72h default
  settlementWindow: 72 * 60 * 60 * 1000,
};

/**
 * Converts dollar amount to Stripe format (cents)
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Converts Stripe amount (cents) to dollars
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Generates a unique invoice number
 */
export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `WIN-${year}${month}-${random}`;
}

/**
 * Formats amount for display
 */
export function formatAmount(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
} 