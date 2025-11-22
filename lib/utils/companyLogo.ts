/**
 * Utility functions for fetching and displaying company logos using Logo.dev API
 */

const LOGO_DEV_PUBLIC_KEY = process.env.NEXT_PUBLIC_LOGO_DEV_KEY || 'pk_IrdsG2s1Ryu63FXBK-A53Q';

/**
 * Extracts and cleans a domain from an email address or company URL
 * @param email - Email address (e.g., "user@company.com")
 * @param companyUrl - Optional company website URL
 * @returns Clean domain string or null
 */
export const getCompanyDomain = (email?: string, companyUrl?: string): string | null => {
  // Priority 1: Company URL if provided
  if (companyUrl) {
    try {
      const url = new URL(companyUrl.startsWith('http') ? companyUrl : `https://${companyUrl}`);
      return url.hostname.replace(/^www\./, '').toLowerCase();
    } catch {
      // Invalid URL, try to extract domain from string
      const domainMatch = companyUrl.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
      if (domainMatch) {
        return domainMatch[1].replace(/^www\./, '').toLowerCase();
      }
      return null;
    }
  }
  
  // Priority 2: Extract domain from email
  if (email && email.includes('@')) {
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain) {
      return domain.replace(/^www\./, '');
    }
  }
  
  return null;
};

/**
 * Generates a Logo.dev URL for a company domain
 * @param domain - Company domain (e.g., "uber.com")
 * @param options - Options for logo generation
 * @returns Logo.dev URL string
 */
export const getCompanyLogoUrl = (
  domain: string,
  options: {
    theme?: 'light' | 'dark';
    format?: 'png' | 'svg';
    size?: number;
    fallback?: boolean;
  } = {}
): string => {
  if (!domain) {
    return '/company.svg'; // Fallback to default icon
  }
  
  // Clean domain
  const cleanDomain = domain
    .replace(/^www\./, '')
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .toLowerCase()
    .trim();
  
  if (!cleanDomain) {
    return '/company.svg';
  }
  
  // Build query parameters
  const params = new URLSearchParams();
  
  // Add token
  params.append('token', LOGO_DEV_PUBLIC_KEY);
  
  // Add theme (dark for dark backgrounds, light for light backgrounds)
  if (options.theme) {
    params.append('theme', options.theme);
  }
  
  // Add format
  if (options.format) {
    params.append('format', options.format);
  }
  
  // Add size (Logo.dev supports size parameter)
  if (options.size) {
    params.append('size', options.size.toString());
  }
  
  // Suppress monogram fallback if requested
  if (options.fallback === false) {
    params.append('fallback', '404');
  }
  
  const queryString = params.toString();
  return `https://img.logo.dev/${cleanDomain}${queryString ? `?${queryString}` : ''}`;
};

/**
 * Gets company logo URL from user data (email or company URL)
 * @param email - User email address
 * @param companyUrl - Optional company website URL
 * @param theme - Theme for logo (light/dark)
 * @returns Logo URL or fallback icon path
 */
export const getCompanyLogoFromUser = (
  email?: string,
  companyUrl?: string,
  theme: 'light' | 'dark' = 'dark'
): string => {
  const domain = getCompanyDomain(email, companyUrl);
  
  if (!domain) {
    return '/company.svg'; // Fallback to default company icon
  }
  
  return getCompanyLogoUrl(domain, { theme, format: 'png' });
};

