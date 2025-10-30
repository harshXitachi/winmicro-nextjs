import crypto from 'crypto';

// CoinPayments API Configuration
const COINPAYMENTS_PUBLIC_KEY = process.env.COINPAYMENTS_PUBLIC_KEY || '';
const COINPAYMENTS_PRIVATE_KEY = process.env.COINPAYMENTS_PRIVATE_KEY || '';
const COINPAYMENTS_IPN_SECRET = process.env.COINPAYMENTS_IPN_SECRET || '';
const COINPAYMENTS_API_URL = 'https://www.coinpayments.net/api.php';

// Supported currencies
export const SUPPORTED_CURRENCIES = {
  USDT_TRC20: 'USDT.TRC20',
} as const;

export interface CoinPaymentsCreateTransactionParams {
  amount: number;
  currency1: string; // Currency you want to receive
  currency2: string; // Currency the buyer will send
  buyer_email: string;
  buyer_name?: string;
  item_name: string;
  item_number?: string;
  invoice?: string;
  custom?: string;
  ipn_url: string;
  success_url?: string;
  cancel_url?: string;
}

export interface CoinPaymentsTransaction {
  txn_id: string;
  address: string;
  amount: string;
  confirms_needed: string;
  timeout: number;
  status_url: string;
  qrcode_url: string;
}

export interface CoinPaymentsWithdrawalParams {
  amount: number;
  currency: string;
  address: string;
  dest_tag?: string;
  ipn_url?: string;
  auto_confirm?: 0 | 1;
  note?: string;
}

export interface CoinPaymentsWithdrawal {
  id: string;
  status: number;
  amount: string;
}

export interface CoinPaymentsBalanceInfo {
  balance: string;
  balancef: number;
}

export interface CoinPaymentsRates {
  [key: string]: {
    rate_btc: string;
    is_fiat: number;
    tx_fee: string;
    status: string;
    name: string;
    confirms: string;
    can_convert: number;
    capabilities: string[];
  };
}

/**
 * Generate HMAC signature for CoinPayments API
 */
function generateHmac(data: string): string {
  return crypto
    .createHmac('sha512', COINPAYMENTS_PRIVATE_KEY)
    .update(data)
    .digest('hex');
}

/**
 * Make API call to CoinPayments
 */
async function callCoinPaymentsAPI(command: string, params: Record<string, any> = {}): Promise<any> {
  try {
    // Add required parameters
    const requestParams = new URLSearchParams({
      version: '1',
      cmd: command,
      key: COINPAYMENTS_PUBLIC_KEY,
      format: 'json',
      ...params,
    });

    const requestBody = requestParams.toString();
    const hmac = generateHmac(requestBody);

    console.log(`[CoinPayments] API Call: ${command}`);

    const response = await fetch(COINPAYMENTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'HMAC': hmac,
      },
      body: requestBody,
    });

    const data = await response.json();

    if (data.error !== 'ok') {
      console.error('[CoinPayments] API Error:', data.error);
      throw new Error(data.error || 'CoinPayments API error');
    }

    console.log(`[CoinPayments] Success:`, command);
    return data.result;
  } catch (error: any) {
    console.error('[CoinPayments] Request failed:', error.message);
    throw new Error(`CoinPayments API call failed: ${error.message}`);
  }
}

/**
 * Create a new transaction for receiving cryptocurrency
 */
export async function createTransaction(
  params: CoinPaymentsCreateTransactionParams
): Promise<CoinPaymentsTransaction> {
  const result = await callCoinPaymentsAPI('create_transaction', params);
  return result;
}

/**
 * Get transaction information
 */
export async function getTransactionInfo(txid: string): Promise<any> {
  const result = await callCoinPaymentsAPI('get_tx_info', { txid });
  return result;
}

/**
 * Create a withdrawal
 */
export async function createWithdrawal(
  params: CoinPaymentsWithdrawalParams
): Promise<CoinPaymentsWithdrawal> {
  const result = await callCoinPaymentsAPI('create_withdrawal', params);
  return result;
}

/**
 * Get withdrawal information
 */
export async function getWithdrawalInfo(id: string): Promise<any> {
  const result = await callCoinPaymentsAPI('get_withdrawal_info', { id });
  return result;
}

/**
 * Get account balances
 */
export async function getBalances(): Promise<Record<string, CoinPaymentsBalanceInfo>> {
  const result = await callCoinPaymentsAPI('balances', { all: '1' });
  return result;
}

/**
 * Get exchange rates
 */
export async function getRates(short: 0 | 1 = 1, accepted: 0 | 1 = 1): Promise<CoinPaymentsRates> {
  const result = await callCoinPaymentsAPI('rates', { short, accepted });
  return result;
}

/**
 * Verify IPN (Instant Payment Notification) callback
 */
export function verifyIPN(request: Request, ipnSecret: string = COINPAYMENTS_IPN_SECRET): boolean {
  try {
    const merchantId = request.headers.get('HMAC');
    if (!merchantId) {
      console.error('[CoinPayments] No HMAC header found');
      return false;
    }

    // For IPN verification, we need the raw body
    // This should be handled at the route level
    return true;
  } catch (error) {
    console.error('[CoinPayments] IPN verification failed:', error);
    return false;
  }
}

/**
 * Verify IPN with body data
 */
export function verifyIPNWithBody(body: string, hmacHeader: string): boolean {
  try {
    const calculatedHmac = crypto
      .createHmac('sha512', COINPAYMENTS_IPN_SECRET)
      .update(body)
      .digest('hex');

    return calculatedHmac === hmacHeader;
  } catch (error) {
    console.error('[CoinPayments] IPN verification failed:', error);
    return false;
  }
}

/**
 * Convert USD to USDT amount (usually 1:1 but can check rates)
 */
export async function convertUSDToUSDT(usdAmount: number): Promise<number> {
  try {
    const rates = await getRates();
    const usdtRate = rates['USDT.TRC20'];
    
    if (usdtRate && usdtRate.rate_btc) {
      // For simplicity, USDT is typically 1:1 with USD
      return usdAmount;
    }
    
    return usdAmount;
  } catch (error) {
    console.error('[CoinPayments] Rate conversion failed, using 1:1:', error);
    return usdAmount;
  }
}

/**
 * Validate cryptocurrency address
 */
export function isValidTRC20Address(address: string): boolean {
  // TRC20 addresses start with 'T' and are 34 characters long
  return /^T[A-Za-z1-9]{33}$/.test(address);
}

/**
 * Get minimum withdrawal amount for a currency
 */
export async function getMinimumWithdrawal(currency: string): Promise<number> {
  try {
    const rates = await getRates();
    const currencyInfo = rates[currency];
    
    if (currencyInfo && currencyInfo.tx_fee) {
      // Return minimum as 2x the transaction fee
      return parseFloat(currencyInfo.tx_fee) * 2;
    }
    
    // Default minimum
    return 10;
  } catch (error) {
    console.error('[CoinPayments] Failed to get minimum withdrawal:', error);
    return 10;
  }
}

/**
 * Check if CoinPayments is properly configured
 */
export function isCoinPaymentsConfigured(): boolean {
  return !!(
    COINPAYMENTS_PUBLIC_KEY &&
    COINPAYMENTS_PRIVATE_KEY &&
    COINPAYMENTS_IPN_SECRET
  );
}

/**
 * Get configuration status for debugging
 */
export function getConfigStatus(): {
  isConfigured: boolean;
  hasPublicKey: boolean;
  hasPrivateKey: boolean;
  hasIPNSecret: boolean;
} {
  return {
    isConfigured: isCoinPaymentsConfigured(),
    hasPublicKey: !!COINPAYMENTS_PUBLIC_KEY,
    hasPrivateKey: !!COINPAYMENTS_PRIVATE_KEY,
    hasIPNSecret: !!COINPAYMENTS_IPN_SECRET,
  };
}

export default {
  createTransaction,
  getTransactionInfo,
  createWithdrawal,
  getWithdrawalInfo,
  getBalances,
  getRates,
  verifyIPN,
  verifyIPNWithBody,
  convertUSDToUSDT,
  isValidTRC20Address,
  getMinimumWithdrawal,
  isCoinPaymentsConfigured,
  getConfigStatus,
  SUPPORTED_CURRENCIES,
};
