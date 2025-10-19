/**
 * Currency Helper Utilities
 * Provides type-safe currency operations and formatting
 */

export type Currency = 'INR' | 'USD' | 'USDT';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  USDT: '₮',
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  INR: 'Indian Rupee',
  USD: 'US Dollar',
  USDT: 'Tether (USDT)',
};

export const CURRENCY_FLAGS: Record<Currency, string> = {
  INR: '🇮🇳',
  USD: '🇺🇸',
  USDT: '🔷', // Tether logo representation
};

/**
 * Exchange rates relative to INR (base currency)
 * In production, these should be fetched from a live API
 */
export const EXCHANGE_RATES: Record<Currency, number> = {
  INR: 1,
  USD: 83.50, // 1 USD = 83.50 INR
  USDT: 83.50, // 1 USDT = 83.50 INR (pegged to USD)
};

/**
 * Format amount with currency symbol
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const formatted = amount.toLocaleString('en-IN', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  });
  
  // USD and USDT symbols go before the amount, INR symbol goes after
  if (currency === 'INR') {
    return `${symbol}${formatted}`;
  }
  return `${symbol}${formatted}`;
}

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency
): number {
  if (from === to) return amount;
  
  // Convert to INR first (base currency), then to target currency
  const inINR = amount * EXCHANGE_RATES[from];
  const result = inINR / EXCHANGE_RATES[to];
  
  return parseFloat(result.toFixed(2));
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency];
}

/**
 * Get currency name
 */
export function getCurrencyName(currency: Currency): string {
  return CURRENCY_NAMES[currency];
}

/**
 * Get currency flag emoji
 */
export function getCurrencyFlag(currency: Currency): string {
  return CURRENCY_FLAGS[currency];
}

/**
 * Get payment gateway for currency
 */
export function getPaymentGateway(currency: Currency): string {
  switch (currency) {
    case 'INR':
      return 'PhonePe';
    case 'USD':
      return 'PayPal';
    case 'USDT':
      return 'Crypto Wallet';
    default:
      return 'Unknown';
  }
}

/**
 * Get payment gateway icon
 */
export function getPaymentGatewayIcon(currency: Currency): string {
  switch (currency) {
    case 'INR':
      return '📱'; // Phone icon for PhonePe
    case 'USD':
      return '💳'; // Card icon for PayPal
    case 'USDT':
      return '🔐'; // Lock icon for Crypto
    default:
      return '💰';
  }
}

/**
 * Validate currency type
 */
export function isValidCurrency(currency: string): currency is Currency {
  return ['INR', 'USD', 'USDT'].includes(currency);
}

/**
 * Get all supported currencies
 */
export function getSupportedCurrencies(): Currency[] {
  return ['INR', 'USD', 'USDT'];
}

/**
 * Parse currency amount string to number
 */
export function parseCurrencyAmount(amountString: string): number {
  // Remove currency symbols and commas
  const cleaned = amountString.replace(/[₹$₮,]/g, '').trim();
  return parseFloat(cleaned) || 0;
}

/**
 * Calculate commission amount
 */
export function calculateCommission(
  amount: number,
  commissionRate: number
): number {
  return parseFloat((amount * (commissionRate / 100)).toFixed(2));
}

/**
 * Get currency color for UI
 */
export function getCurrencyColor(currency: Currency): string {
  switch (currency) {
    case 'INR':
      return 'text-orange-600 bg-orange-100';
    case 'USD':
      return 'text-green-600 bg-green-100';
    case 'USDT':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}
